import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendLoginNotificationEmail, sendWelcomeEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimiter";

const GOOGLE_OAUTH_PLACEHOLDER = "OAUTH:google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        // Rate limit login: 10 attempts per IP per 15 minutes
        const ip =
          (request as Request | undefined)
            ?.headers?.get?.("x-forwarded-for")
            ?.split(",")[0]
            .trim() ?? "unknown";
        if (!checkRateLimit(`login:${ip}`, 10, 15 * 60_000)) {
          return null; // NextAuth converts null to CredentialsSignin error
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: { id: true, name: true, email: true, password: true, role: true },
        });

        if (!user) return null;

        if (!user.password || user.password === GOOGLE_OAUTH_PLACEHOLDER) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) return null;

        sendLoginNotificationEmail(user.email, user.name).catch((err) =>
          console.error("[Auth] Login email failed:", err)
        );

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],

  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      const email = user.email?.toLowerCase();
      if (!email) return false;

      const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (!existing) {
        const userName = user.name ?? email.split("@")[0];
        try {
          await prisma.user.create({
            data: {
              name: userName,
              email,
              password: GOOGLE_OAUTH_PLACEHOLDER,
              newsletter: false,
            },
          });
        } catch (err) {
          console.error("[Auth] Failed to create Google user:", err);
          return false;
        }

        sendWelcomeEmail(email, userName).catch((err) =>
          console.error("[Auth] Google welcome email failed:", err)
        );
      } else {
        sendLoginNotificationEmail(email, user.name ?? email).catch((err) =>
          console.error("[Auth] Google login email failed:", err)
        );
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-expect-error role is added in authorize
        token.role = user.role ?? "USER";
      }
      // Refresh role from DB on each token refresh
      if (token.id && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "USER";
      }
      return token;
    },

    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
      }
      return session;
    },
  },

  session: { strategy: "jwt" },
});
