import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });

  const orders = await prisma.order.findMany({
    include: { items: true, user: { select: { firstName: true, lastName: true, phone: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ orders });
}
