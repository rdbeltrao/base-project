import Cookies from 'js-cookie'

export const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'

const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || 'localhost'

const getCookieOptions = ({ domain = COOKIE_DOMAIN }: { domain?: string }) => {
  const options: Cookies.CookieAttributes = {
    path: '/',
    sameSite: 'lax',
  }

  if (domain) {
    options.domain = domain
  }

  return options
}

const setCookie = (
  authToken: string,
  { cookieName = COOKIE_NAME, domain = COOKIE_DOMAIN }: { cookieName?: string; domain?: string }
) => {
  Cookies.set(cookieName, authToken, getCookieOptions({ domain }))
}

const getCookie = ({ cookieName = COOKIE_NAME }: { cookieName?: string }) => {
  return Cookies.get(cookieName)
}

const removeCookie = ({
  cookieName = COOKIE_NAME,
  domain = COOKIE_DOMAIN,
}: {
  cookieName?: string
  domain?: string
}) => {
  Cookies.remove(cookieName, getCookieOptions({ domain }))
}

export { getCookieOptions, removeCookie, setCookie, getCookie }
