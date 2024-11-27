import { NextRequest, NextResponse } from "next/server"

// Middleware function to block users with restricted languages or geolocation
export function middleware(req: NextRequest) {
  // Extract browser's language
  const acceptLanguage = req.headers.get("accept-language") || ""
  const browserLanguage = acceptLanguage.split(",")[0]

  // Detect if the user has Bahasa Indonesia as the browser language
  const isRestrictedLanguage = browserLanguage.startsWith("id") // "id" is the language code for Bahasa Indonesia

  // Detect user geolocation (requires deployment on a platform like Vercel)
  const userCountry = req.geo?.country || "" // Get the user's country code (e.g., "ID" for Indonesia)

  // Block users based on browser language or country
  const isRestrictedCountry = userCountry === "ID" // Restrict users from Indonesia (country code "ID")

  if (isRestrictedLanguage || isRestrictedCountry) {
    // Simulate a dead website with a "Bad Gateway" or similar error
    return new Response(null, {
      status: 502, // Bad Gateway (or you can use 503 Service Unavailable)
      headers: { "Content-Type": "text/html" },
    })
  }

  // Allow the request for unrestricted users
  return NextResponse.next()
}

export const config = {
  matcher: "/:path*", // Apply middleware to all routes
}
