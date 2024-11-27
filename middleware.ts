import { NextRequest, NextResponse } from "next/server"

// Middleware function to block users with restricted languages or simulate a "dead" website
export function middleware(req: NextRequest) {
  // Extract browser's language
  const acceptLanguage = req.headers.get("accept-language") || ""
  const browserLanguage = acceptLanguage.split(",")[0]

  // Detect if the user has Bahasa Indonesia as the browser language
  const isRestricted = browserLanguage.startsWith("id") // "id" is the language code for Bahasa Indonesia

  if (isRestricted) {
    // Simulate a dead website with a "Bad Gateway" or similar error
    return new Response(null, {
      status: 502, // Bad Gateway (or you can use 503 Service Unavailable)
      headers: { "Content-Type": "text/html" },
    })
  }
  const url = new URL(req.url)
  const hostname = url.hostname

  // Handle subdomain logic
  if (hostname === "admin.dokmaistore.com") {
    url.pathname = `/admin${url.pathname}` // Prefix all routes with `/admin`
    return NextResponse.rewrite(url)
  }

  // Allow the request for unrestricted users
  return NextResponse.next()
}

export const config = {
  matcher: "/:path*",
}
