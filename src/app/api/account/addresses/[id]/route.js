import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });

  const address = await prisma.address.findUnique({ where: { id: params.id } });
  if (!address || address.userId !== user.id) {
    return NextResponse.json({ error: 'آدرس یافت نشد' }, { status: 404 });
  }

  const body = await request.json();
  const { label, fullName, phone, city, address: addr, postal, isDefault } = body;

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false }
    });
  }

  const updated = await prisma.address.update({
    where: { id: params.id },
    data: { label, fullName, phone, city, address: addr, postal, isDefault: isDefault || false }
  });

  return NextResponse.json({ address: updated });
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });

  const address = await prisma.address.findUnique({ where: { id: params.id } });
  if (!address || address.userId !== user.id) {
    return NextResponse.json({ error: 'آدرس یافت نشد' }, { status: 404 });
  }

  await prisma.address.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
