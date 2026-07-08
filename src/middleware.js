import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const COOKIE_NAME = 'megamarket_session';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    let decoded = null;
    if (token) {
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch {
        decoded = null;
      }
    }

    if (!decoded) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // نکته: نقش ادمین در توکن ذخیره نشده تا با تغییر نقش کاربر در دیتابیس
    // فوراً منقضی شود؛ بررسی دقیق نقش در خود صفحات/API های ادمین با
    // getCurrentUser (که از دیتابیس می‌خواند) انجام می‌شود. این میدلور فقط
    // ورود کاربر را تایید می‌کند تا کاربر مهمان مستقیماً به admin نرسد.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
