import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = [
  "/wishlist",
  "/cart",
  "/profile",
];

export default async function middleware(req: NextRequest) {
  const { userId } = await getAuth(req);
  const path = req.nextUrl.pathname;

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    path.startsWith(route)
  );

  if (!userId && isProtectedRoute) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', path);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
