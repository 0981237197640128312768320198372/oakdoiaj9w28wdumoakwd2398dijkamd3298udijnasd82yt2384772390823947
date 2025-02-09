import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const acceptLanguage = req.headers.get('accept-language') || '';
  const browserLanguage = acceptLanguage.split(',')[0];

  const isRestrictedLanguage = browserLanguage.startsWith('id');

  const userCountry = req.geo?.country || '';

  const isRestrictedCountry = userCountry === 'ID';

  if (isRestrictedLanguage || isRestrictedCountry) {
    return new Response(null, {
      status: 502,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
