/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const userAgent = req.headers.get('user-agent') || '';
  const allowedUserAgent =
    'Mozilla/5.0 (Windows NT 10.0; WOW64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6666.666 Safari/537.36';
  const isAllowedUserAgent = userAgent === allowedUserAgent;

  if (isAllowedUserAgent) {
    return NextResponse.next();
  }

  const acceptLanguage = req.headers.get('accept-language') || '';
  const browserLanguage = acceptLanguage.split(',')[0];
  const isRestrictedLanguage = browserLanguage.startsWith('id');

  const userCountry = (req as any).geo?.country || '';
  const isRestrictedCountry = userCountry === 'ID';

  if (isRestrictedLanguage || isRestrictedCountry) {
    return new Response(null, {
      status: 502,
      headers: { 'Content-Type': 'text/html' },
    });
  }
  const hostname = req.headers.get('host')?.toLowerCase();
  const path = req.nextUrl.pathname;

  if (hostname === 'admin.dokmaistore.com') {
    return NextResponse.rewrite(new URL(`/admin${path}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
