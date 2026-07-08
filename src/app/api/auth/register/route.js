import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { signToken, COOKIE_NAME, TOKEN_MAX_AGE_SECONDS } from '@/lib/auth';

const schema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  phone: z.string().regex(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست'),
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
});

export async function POST(request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue.message, field: firstIssue.path[0] },
      { status: 400 }
    );
  }

  const { firstName, lastName, phone, email, password } = parsed.data;

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json({ error: 'این ایمیل قبلاً ثبت شده است', field: 'email' }, { status: 409 });
  }
  const existingPhone = await prisma.user.findUnique({ where: { phone } });
  if (existingPhone) {
    return NextResponse.json({ error: 'این شماره موبایل قبلاً ثبت شده است', field: 'phone' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { firstName, lastName, phone, email, passwordHash, role: 'USER' }
  });

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
