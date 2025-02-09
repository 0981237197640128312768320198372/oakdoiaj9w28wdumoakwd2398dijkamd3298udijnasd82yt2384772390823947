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

  // 2. VPN/Proxy Detection using ProxyCheck.io
  // Obtain the client IP address.
  const ip = req.ip || req.headers.get('x-forwarded-for') || '';
  if (ip) {
    // Build the API URL. If you have an API key, include it as a query parameter.
    let vpnCheckUrl = `https://proxycheck.io/v2/${ip}?vpn=1`;
    const proxyCheckApiKey = process.env.PROXYCHECK_API_KEY;
    if (proxyCheckApiKey) {
      vpnCheckUrl += `&key=${proxyCheckApiKey}`;
    }
    try {
      const vpnResponse = await fetch(vpnCheckUrl);
      const vpnData = await vpnResponse.json();
      // The API returns a JSON object keyed by the IP address.
      // If the IP is flagged as a proxy, the "proxy" field should be "yes".
      const result = vpnData[ip];
      if (result && result.proxy === 'yes') {
        return new Response(null, {
          status: 502,
          headers: { 'Content-Type': 'text/html' },
        });
      }
    } catch (error) {
      // Optionally, you might log the error or decide on a fallback behavior.
    }
  }

  // 3. Language and Geolocation Checks
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
