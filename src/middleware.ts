// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl as URL;
  const pathname = url.pathname;

  // Public routes (no auth)
  const publicPaths = [
    "/login",
    "/register",
    "/api/auth", // NextAuth endpoints (all under /api/auth)
    "/api/register",
    "/_next", // Next internals
    "/favicon.ico",
    "/api/debug-env", // ENV testing
    "/images",
    "/public",
    "/forgot-password",
    "/reset-password",
    "/api/cron/daily", // cron jobs
    "/api/cron/monthly", // cron jobs
  ];
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Read JWT (NextAuth v4)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Require sign-in for all non-public routes
  if (!token) {
    const login = new URL("/login", url.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  // Extra guard for /admin/**
  if (pathname.startsWith("/admin") && token.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/feed", url.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
