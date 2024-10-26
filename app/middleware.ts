// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname

  // Add debugging header
  const response = NextResponse.next()
  response.headers.set("x-debug-middleware", `hostname: ${hostname}`)

  if (hostname.startsWith("help")) {
    request.nextUrl.pathname = `/help${request.nextUrl.pathname}`
    response.headers.set("x-debug-middleware", `routing to help`)
  } else if (hostname.startsWith("app")) {
    request.nextUrl.pathname = `/app${request.nextUrl.pathname}`
    response.headers.set("x-debug-middleware", `routing to app`)
  } else {
    response.headers.set("x-debug-middleware", `no matching subdomain`)
  }

  return NextResponse.rewrite(request.nextUrl)
}
