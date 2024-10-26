import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname

  if (hostname.startsWith("help")) {
    request.nextUrl.pathname = `/help${request.nextUrl.pathname}`
  } else if (hostname.startsWith("app")) {
    request.nextUrl.pathname = `/app${request.nextUrl.pathname}`
  }

  return NextResponse.rewrite(request.nextUrl)
}
