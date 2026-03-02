import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendLoginNotificationEmail, sendWelcomeEmail } from "@/lib/email";

// Placeholder stored for Google-only accounts.
// Can never match a real bcrypt hash → password login is impossible for these users.
const GOOGLE_OAUTH_PLACEHOLDER = "OAUTH:google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // ── Google OAuth ───────────────────────────────────────────────────────
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ── Email / Password ───────────────────────────────────────────────────
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: { id: true, name: true, email: true, password: true },
        });

        if (!user) return null;

        // Block Google-only accounts from password login
        if (!user.password || user.password === GOOGLE_OAUTH_PLACEHOLDER) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) return null;

        // Fire-and-forget login notification
        sendLoginNotificationEmail(user.email, user.name).catch((err) =>
          console.error("[Auth] Login email failed:", err)
        );

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],

  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },

  callbacks: {
    // Runs after a successful OAuth sign-in.
    // Auto-creates a row for first-time Google users, then lets them through.
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

        console.log("[Auth] New Google user auto-registered:", email);

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

    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  session: { strategy: "jwt" },
});
