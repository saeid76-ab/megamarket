import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'لطفاً همه فیلدها را پر کنید' }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد' }, { status: 400 });
  }

  const fullUser = await prisma.user.findUnique({ where: { id: currentUser.id } });
  const valid = await bcrypt.compare(currentPassword, fullUser.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'رمز عبور فعلی اشتباه است' }, { status: 401 });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: currentUser.id }, data: { passwordHash: newHash } });

  return NextResponse.json({ ok: true });
}
