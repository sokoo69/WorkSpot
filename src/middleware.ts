import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en', 'bn'],
  defaultLocale: 'en'
});

const protectedRoutePatterns = [
  /^\/[a-z]{2}\/spaces\/add/,
  /^\/[a-z]{2}\/spaces\/manage/,
  /^\/[a-z]{2}\/dashboard/,
  /^\/[a-z]{2}\/bookings\/my/,
  /^\/[a-z]{2}\/favorites/,
];

export async function middleware(request: NextRequest) {
  // 1. Run intl middleware first
  const response = intlMiddleware(request);

  const path = request.nextUrl.pathname;
  
  // Exclude API routes from auth check in middleware if not protected here
  if (path.startsWith('/api/')) return response;

  const isProtectedRoute = protectedRoutePatterns.some(pattern => pattern.test(path));

  if (isProtectedRoute) {
    let session = null;
    try {
      const authRes = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
        headers: { cookie: request.headers.get('cookie') || '' },
      });
      if (authRes.ok) {
        session = await authRes.json();
      }
    } catch (error) {
      console.error('Middleware session fetch error:', error);
    }

    if (!session || !session.user) {
      const locale = path.split('/')[1] || 'en';
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|.*\\..*).*)',
  ],
};
