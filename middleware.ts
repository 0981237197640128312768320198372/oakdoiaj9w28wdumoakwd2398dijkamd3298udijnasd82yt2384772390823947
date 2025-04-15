import { NextRequest, NextResponse } from 'next/server';

interface GeoRequest extends NextRequest {
  geo?: { country?: string };
}

export async function middleware(req: GeoRequest) {
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
  const userCountry = req.geo?.country || '';
  const isRestrictedCountry = userCountry === 'ID';

  if (isRestrictedLanguage || isRestrictedCountry) {
    return new Response(null, { status: 403, headers: { 'Content-Type': 'text/html' } });
  }

  const hostname = req.headers.get('host')?.toLowerCase();
  const path = req.nextUrl.pathname;

  if (hostname === 'dokmaistore.com' && path.startsWith('/admin')) {
    return new Response(null, { status: 404, headers: { 'Content-Type': 'text/html' } });
  }

  if (hostname === 'admin.dokmaistore.com') {
    return NextResponse.rewrite(new URL(`/admin${path}`, req.url));
  }

  if (hostname?.includes('localhost') && path.startsWith('/admin')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
