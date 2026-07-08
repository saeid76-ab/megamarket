import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

const validStatuses = ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export async function PATCH(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });

  const { status } = await request.json();
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'وضعیت نامعتبر است' }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status }
  });

  return NextResponse.json({ order });
}
