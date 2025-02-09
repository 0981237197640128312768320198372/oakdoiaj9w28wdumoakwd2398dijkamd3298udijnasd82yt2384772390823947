import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  // 1. Check the user agent exemption.
  const userAgent = req.headers.get('user-agent') || '';
  const allowedUserAgent =
    'Mozilla/5.0 (Windows NT 10.0; WOW64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6809.85 Safari/537.36';
  const isAllowedUserAgent = userAgent === allowedUserAgent;

  if (isAllowedUserAgent) {
    // Bypass all checks if the user agent is the allowed one.
    return NextResponse.next();
  }

  // 2. Language and Geolocation Checks
  // Check the browser's language from the accept-language header.
  const acceptLanguage = req.headers.get('accept-language') || '';
  const browserLanguage = acceptLanguage.split(',')[0];
  const isRestrictedLanguage = browserLanguage.startsWith('id');

  // Check geolocation from the request.
  const userCountry = req.geo?.country || '';
  const isRestrictedCountry = userCountry === 'ID';

  // Block the request if it's from a restricted language or country.
  if (isRestrictedLanguage || isRestrictedCountry) {
    return new Response(null, {
      status: 502,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Allow the request if all checks pass.
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
