import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken, COOKIE_NAME, TOKEN_MAX_AGE_SECONDS } from '@/lib/auth';

export async function POST(request) {
  const body = await request.json();
  const identifier = (body.identifier || '').trim();
  const password = body.password || '';

  if (!identifier || !password) {
    return NextResponse.json({ error: 'لطفاً همه فیلدها را پر کنید' }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }]
    }
  });

  if (!user) {
    return NextResponse.json({ error: 'شماره موبایل/ایمیل یا رمز عبور اشتباه است' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'شماره موبایل/ایمیل یا رمز عبور اشتباه است' }, { status: 401 });
  }

  const token = signToken({ userId: user.id });

  const response = NextResponse.json({
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_MAX_AGE_SECONDS,
    path: '/'
  });

  return response;
}
