// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const subdomain = url.hostname.split(".")[0]

  if (subdomain === "help") {
    url.pathname = `/help${url.pathname}` // Route to /help
  } else if (subdomain === "app") {
    url.pathname = `/app${url.pathname}` // Route to /app
  }

  return NextResponse.rewrite(url)
}
