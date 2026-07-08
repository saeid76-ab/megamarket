import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });

  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { firstName: true, lastName: true } },
      product: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ reviews });
}

export async function PATCH(request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });

  const { reviewId, approved } = await request.json();

  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { approved }
  });
  return NextResponse.json({ review });
}

export async function DELETE(request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });

  const { reviewId } = await request.json();
  await prisma.review.delete({ where: { id: reviewId } });
  return NextResponse.json({ ok: true });
}
