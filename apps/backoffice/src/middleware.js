import { NextResponse } from 'next/server';
import acceptLanguage from 'accept-language';
import { fallbackLng, languages, cookieName } from '@test-pod/translation/settings';

acceptLanguage.languages([...languages]); // Ensure languages is an array

export const config = {
  // matcher: '/:lng*'
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest).*)']
};

export function middleware(req) {
  let lng;
  if (req.cookies.has(cookieName)) {
    const cookieValue = req.cookies.get(cookieName)?.value;
    if (cookieValue) {
      lng = acceptLanguage.get(cookieValue);
    }
  }
  if (!lng) {
    const acceptLangHeader = req.headers.get('Accept-Language');
    if (acceptLangHeader) {
      lng = acceptLanguage.get(acceptLangHeader);
    }
  }
  if (!lng) {
    lng = fallbackLng;
  }

  // Redirect if lng in path is not supported or missing
  if (
    !languages.some(loc => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith('/_next') // Exclude Next.js specific paths
  ) {
    const newPath = `/${lng}${req.nextUrl.pathname}${req.nextUrl.search}`;
    return NextResponse.redirect(new URL(newPath, req.url));
  }

  // Store the language in a cookie if referer indicates a language change
  if (req.headers.has('referer')) {
    const refererUrl = new URL(req.headers.get('referer'));
    const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`));
    const response = NextResponse.next();
    if (lngInReferer) {
      response.cookies.set(cookieName, lngInReferer);
    }
    return response;
  }

  return NextResponse.next();
}
