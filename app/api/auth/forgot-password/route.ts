import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
  // Rate limit: 3 reset requests per IP per 15 minutes
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(`forgot:${ip}`, 3, 15 * 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait 15 minutes and try again." },
      { status: 429 }
    );
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Look up user — always return success to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true },
    });

    if (user) {
      // Delete any existing tokens for this user first
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

      // Generate a secure random token
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      try {
        await prisma.passwordResetToken.create({
          data: { userId: user.id, token, expiresAt },
        });
        await sendPasswordResetEmail(user.email, user.name, token);
      } catch (err) {
        console.error("[ForgotPassword] Token insert error:", err);
      }
    }

    // Always return the same message to prevent email enumeration
    return NextResponse.json({
      message: "If an account exists for this email, a reset link has been sent.",
    });
  } catch (err) {
    console.error("[ForgotPassword] Error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
