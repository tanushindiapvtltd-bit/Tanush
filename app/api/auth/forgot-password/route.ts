import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
  // Rate limit: 3 reset requests per email per 15 minutes
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
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("id, name, email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (user) {
      // Delete any existing tokens for this user first
      await supabaseAdmin
        .from("password_reset_tokens")
        .delete()
        .eq("user_id", user.id);

      // Generate a secure random token
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      const { error: insertError } = await supabaseAdmin
        .from("password_reset_tokens")
        .insert([{ user_id: user.id, token, expires_at: expiresAt.toISOString() }]);

      if (insertError) {
        console.error("[ForgotPassword] Token insert error:", insertError.message);
      } else {
        await sendPasswordResetEmail(user.email, user.name, token);
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
