import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isAuthenticated = !!req.auth;
    const { pathname } = req.nextUrl;

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && (pathname === "/sign-in" || pathname === "/sign-up")) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // Admin routes — must be ADMIN role
    if (pathname.startsWith("/admin")) {
        if (!req.auth) {
            return NextResponse.redirect(new URL("/sign-in?callbackUrl=/admin", req.url));
        }
        if ((req.auth.user as { role?: string })?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    // Protected user routes
    const protectedPaths = ["/orders", "/wishlist", "/checkout"];
    if (protectedPaths.some((p) => pathname.startsWith(p))) {
        if (!req.auth) {
            return NextResponse.redirect(
                new URL(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
            );
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
