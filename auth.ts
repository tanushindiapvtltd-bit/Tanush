import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { sendLoginNotificationEmail, sendWelcomeEmail } from "@/lib/email";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("id, name, email, password")
          .eq("email", credentials.email)
          .single();

        if (error || !user) return null;

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
    error: "/sign-in", // redirect all auth errors back to sign-in with ?error=
  },

  callbacks: {
    // Runs after a successful OAuth sign-in.
    // Auto-creates a Supabase row for first-time Google users, then lets them through.
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      const email = user.email?.toLowerCase();
      if (!email) return false;

      // Check if user already exists
      const { data: existing } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (!existing) {
        // First-time Google sign-in → create account automatically
        const userName = user.name ?? email.split("@")[0];
        const { error } = await supabaseAdmin.from("users").insert([
          {
            name: userName,
            email,
            password: GOOGLE_OAUTH_PLACEHOLDER,
            newsletter: false,
          },
        ]);

        if (error) {
          console.error("[Auth] Failed to create Google user:", error.message);
          return false;
        }

        console.log("[Auth] New Google user auto-registered:", email);

        // Send welcome email to new Google users
        sendWelcomeEmail(email, userName).catch((err) =>
          console.error("[Auth] Google welcome email failed:", err)
        );
      } else {
        // Returning Google user — send login notification
        sendLoginNotificationEmail(email, user.name ?? email).catch((err) =>
          console.error("[Auth] Google login email failed:", err)
        );
      }

      return true; // allow sign-in → NextAuth creates session → redirects to callbackUrl (/)
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
