// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { User } from "@/types/user";

// Extend the Session type to include id, role, and isActive
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      isActive?: boolean;
    };
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, // ensure set in .env
  session: { strategy: "jwt" }, // we’re not using the Session table
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Basic guard
        if (!credentials?.email || !credentials?.password) return null;

        // ✅ Normalize and make lookup case-insensitive
        const normalizedEmail = credentials.email.trim().toLowerCase();

        // Lookup user
        const user = await prisma.user.findFirst({
          where: { email: { equals: normalizedEmail, mode: "insensitive" } },
        });
        if (!user) return null;

        if (!user.isActive) throw new Error("Account disabled");
        // Verify password
        const ok = await compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        // Minimal user object for JWT
        return {
          id: user.id,
          email: user.email,
          name:
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            undefined,
          role: user.role,
          isActive: user.isActive,
        };
      },
    }),
  ],
  // Optional: customize JWT/user fields
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.role = (user as User).role;
        token.isActive = (user as User).isActive;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isActive = token.isActive;
      }
      return session;
    },
  },
};
