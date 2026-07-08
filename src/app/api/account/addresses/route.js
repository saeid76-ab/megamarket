import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
  });
  return NextResponse.json({ addresses });
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });

  const body = await request.json();
  const { label, fullName, phone, city, address, postal, isDefault } = body;

  if (!fullName || !phone || !city || !address || !postal) {
    return NextResponse.json({ error: 'همه فیلدها الزامی هستند' }, { status: 400 });
  }

  // اگر این آدرس پیش‌فرض است، بقیه را غیرپیش‌فرض کن
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false }
    });
  }

  const newAddress = await prisma.address.create({
    data: {
      userId: user.id,
      label: label || 'آدرس جدید',
      fullName,
      phone,
      city,
      address,
      postal,
      isDefault: isDefault || false
    }
  });

  return NextResponse.json({ address: newAddress });
}
