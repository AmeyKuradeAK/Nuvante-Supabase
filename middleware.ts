import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

// Define public routes that don't need authentication
const isPublicRoute = createRouteMatcher([
  "/",                    // Home page
  "/Products(.*)",        // All product pages
  "/ProductDetails(.*)",  // Product detail pages
  "/about(.*)",          // About us pages
  "/About(.*)",          // About us pages (alternate case)
  "/contact(.*)",        // Contact pages
  "/Contact(.*)",        // Contact pages (alternate case)
  "/sign-in(.*)",        // Sign in pages
  "/sign-up(.*)",        // Sign up pages
  "/api/propagation(.*)", // Product API routes
  "/api/propagation_client(.*)",
  "/api/populate(.*)",
  "/api/emailify(.*)",
  "/terms-and-conditions(.*)",
  "/privacy-policy(.*)",
  "/refund-and-cancellation(.*)",
  "/forgot(.*)",
  "/_next/(.*)",         // Next.js internals
  "/favicon.ico",        // Favicon
  "/static/(.*)"         // Static files
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};