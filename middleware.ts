// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

interface GeoRequest extends NextRequest {
  geo?: { country?: string };
}

export async function middleware(req: GeoRequest) {
  const acceptLanguage = req.headers.get('accept-language') || '';
  const browserLanguage = acceptLanguage.split(',')[0];
  const isRestrictedLanguage = browserLanguage.startsWith('id');
  const userCountry = req.geo?.country || '';
  const isRestrictedCountry = userCountry === 'ID';

  const origin = req.headers.get('origin');
  const allowedOrigins = [
    'https://dokmaistore.com',
    'https://seller.dokmaistore.com',
    'https://www.dokmaistore.com',
    'https://app.dokmaistore.com',
    'https://admin.dokmaistore.com',
    'http://localhost:3000',
    'http://localhost',
    'https://dokmai.store',
  ];

  if (req.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Max-Age', '31104000');
    }

    return response;
  }

  if (isRestrictedLanguage || isRestrictedCountry) {
    return new Response('Access restricted due to region or language', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const hostname = req.headers.get('host')?.toLowerCase();
  const subdomain = hostname?.split('.')[0];
  const path = req.nextUrl.pathname;

  if (path.startsWith('/api/')) {
    const response = NextResponse.next();

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  }

  if (
    path.startsWith('/favicon') ||
    path.startsWith('/manifest') ||
    path.startsWith('/images') ||
    path.startsWith('/icons') ||
    path.startsWith('/_next/static') ||
    path.startsWith('/_next/image') ||
    path === '/favicon.ico' ||
    path === '/robots.txt' ||
    path === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  if (
    hostname !== 'admin.dokmaistore.com' &&
    !hostname?.includes('localhost') &&
    hostname?.endsWith('dokmaistore.com') &&
    path.startsWith('/admin')
  ) {
    return new Response('Admin access restricted', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Skip subdomain routing for static assets and invalid subdomains
  const invalidSubdomains = [
    'favicon',
    'www',
    'seller',
    'admin',
    'api',
    'static',
    'assets',
    'manifest',
    'robots',
    'sitemap',
  ];

  // Additional check for favicon.ico specifically in subdomain
  if (subdomain === 'favicon' || subdomain?.includes('favicon')) {
    return NextResponse.next();
  }

  if (
    hostname?.includes('.localhost') &&
    subdomain !== 'www' &&
    subdomain &&
    !invalidSubdomains.includes(subdomain)
  ) {
    return NextResponse.rewrite(new URL(`/${subdomain}`, req.url));
  }
  if (hostname?.includes('.dokmai.store') && subdomain && !invalidSubdomains.includes(subdomain)) {
    return NextResponse.rewrite(new URL(`/${subdomain}`, req.url));
  }

  if (hostname?.includes('localhost') && path.startsWith('/seller')) {
    return NextResponse.next();
  }

  if (hostname === 'seller.dokmaistore.com') {
    return NextResponse.rewrite(new URL(`/seller${path}`, req.url));
  }

  if (hostname === 'admin.dokmaistore.com') {
    return NextResponse.rewrite(new URL(`/admin${path}`, req.url));
  }

  if (hostname === 'app.dokmaistore.com') {
    return NextResponse.rewrite(new URL(`/app${path}`, req.url));
  }

  if (hostname?.includes('localhost') && (path.startsWith('/admin') || path.startsWith('/app'))) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
};
