import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/welcome(.*)", // Allow welcome page
  "/api/propagation(.*)", // Allow product propagation without auth
  "/api/create-payment(.*)", // Allow payment creation without auth
  "/api/verify-payment(.*)", // Allow payment verification without auth
  "/api/webhooks/clerk(.*)", // Allow Clerk webhooks without auth
  "/api/profile(.*)", // Allow profile API
  "/api/check-profile(.*)", // Allow profile check API
  "/", // Allow home page without auth
  "/products(.*)", // Allow product pages without auth
  "/category(.*)", // Allow category pages without auth
  "/ProductDetails(.*)", // Allow product details without auth
  "/about(.*)", // Allow about page without auth
  "/Contact(.*)", // Allow contact page without auth
  "/api/products(.*)", // Allow product API without auth
  "/api/categories(.*)", // Allow categories API without auth
]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/Cart(.*)",
  "/Wishlist(.*)",
  "/Profile(.*)",
  "/orders(.*)",
  "/CheckOut(.*)",
  "/api/cart(.*)",
  "/api/wishlist(.*)",
  "/api/orders(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  // Only protect routes that are explicitly marked as protected
  if (isProtectedRoute(request)) {
    await auth.protect();
  }

  // Handle post-signup redirect
  const url = request.nextUrl.clone();
  
  // If user just signed up and is going to home page, redirect to welcome
  if (url.pathname === "/" && url.searchParams.get("signup") === "success") {
    url.pathname = "/welcome";
    url.searchParams.delete("signup");
    return NextResponse.redirect(url);
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
