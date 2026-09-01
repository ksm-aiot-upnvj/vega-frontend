import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Check if token exists in cookies
  const token = request.cookies.get("vega_token")?.value;
  const isAuthPage = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register";
  const isHomePage = request.nextUrl.pathname === "/";

  // Redirect /register to localhost:3000 (home page) as requested by the user
  if (request.nextUrl.pathname === "/register") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is not logged in and tries to access a protected route
  if (!token && !isAuthPage && !isHomePage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is logged in and tries to access login page, redirect them to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. svg, png)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
