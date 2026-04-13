import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { ENV } from "./constants/env-exports";
import { ROUTES } from "./constants/routes";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/app(.*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    const { userId } = await auth();
    if (isProtectedRoute(req)) await auth.protect();

    if (userId && req.nextUrl.pathname === "/") {
      const chatUrl = new URL(ROUTES.CHAT, req.url);
      return NextResponse.redirect(chatUrl);
    }
  },
  {
    publishableKey: ENV.CLERK.CLERK_PUBLISHABLE_KEY,
    secretKey: ENV.CLERK.CLERK_SECRET_KEY,
    signInUrl: ROUTES.LOGIN,
    signUpUrl: ROUTES.SIGN_UP,
  },
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)",
  ],
};
