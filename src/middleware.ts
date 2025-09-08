// src/middleware.ts
export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/((?!api/auth|api/register|login|register|_next|favicon.ico|images|public).*)",
  ],
};
