import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname

  const mainDomain = "dokmaistore.com"

  if (hostname === `help.${mainDomain}`) {
    request.nextUrl.pathname = `/help${request.nextUrl.pathname}`
    return NextResponse.rewrite(request.nextUrl)
  }

  if (hostname === `app.${mainDomain}`) {
    request.nextUrl.pathname = `/app${request.nextUrl.pathname}`
    return NextResponse.rewrite(request.nextUrl)
  }

  return NextResponse.next()
}
