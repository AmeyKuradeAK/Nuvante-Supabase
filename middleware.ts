import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/Wishlist(.*)",  // Match actual folder case
  "/Cart(.*)",      // Match actual folder case
  "/Profile(.*)",   // Match actual folder case
  "/CheckOut(.*)",  // Add checkout to protected routes
  "/api/wishlist(.*)",
  "/api/cart(.*)",
  "/api/profile(.*)",
  "/api/checkout(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
