import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import acceptLanguage from 'accept-language'
import { fallbackLng, languages, cookieName as i18nCookieName } from '@test-pod/translation/settings'
import { redirectMiddleware } from './redirect-middleware'

acceptLanguage.languages([...languages])

const authCookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest).*)'],
}

export async function middleware(req: NextRequest) {
  // i18n logic
  let lng
  if (req.cookies.has(i18nCookieName)) {
    const cookieValue = req.cookies.get(i18nCookieName)?.value
    if (cookieValue) {
      lng = acceptLanguage.get(cookieValue)
    }
  }
  if (!lng) {
    const acceptLangHeader = req.headers.get('Accept-Language')
    if (acceptLangHeader) {
      lng = acceptLanguage.get(acceptLangHeader)
    }
  }
  if (!lng) {
    lng = fallbackLng
  }

  const pathname = req.nextUrl.pathname

  // Redirect if lng in path is not supported or missing
  if (
    !languages.some(loc => pathname.startsWith(`/${loc}`)) &&
    !pathname.startsWith('/_next')
  ) {
    const newPath = `/${lng}${pathname}${req.nextUrl.search}`
    return NextResponse.redirect(new URL(newPath, req.url))
  }

  let response = NextResponse.next()

  // Store the language in a cookie if referer indicates a language change
  if (req.headers.has('referer')) {
    const refererUrl = new URL(req.headers.get('referer'))
    const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`))
    if (lngInReferer) {
      response.cookies.set(i18nCookieName, lngInReferer)
    }
  }

  // Auth logic for dashboard
  if (pathname.includes('/dashboard')) {
    const token = req.cookies.get(authCookieName)?.value
    const redirectResult = await redirectMiddleware(
      token,
      process.env.JWT_SECRET || 'your-secret-key',
      authUrl,
      pathname
    )

    if (redirectResult.redirect && redirectResult.destination) {
      return NextResponse.redirect(redirectResult.destination)
    }
  }

  return response
}
