import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request, { params }) {
  const reviews = await prisma.review.findMany({
    where: { productId: params.id, approved: true },
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ reviews });
}

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'برای ثبت نظر ابتدا وارد حساب کاربری شوید' }, { status: 401 });

  const { rating, comment } = await request.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'امتیاز باید بین ۱ تا ۵ باشد' }, { status: 400 });
  }
  if (!comment || comment.trim().length < 5) {
    return NextResponse.json({ error: 'متن نظر باید حداقل ۵ کاراکتر باشد' }, { status: 400 });
  }

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: user.id, productId: params.id } }
  });
  if (existing) {
    return NextResponse.json({ error: 'شما قبلاً برای این محصول نظر ثبت کرده‌اید' }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: {
      userId: user.id,
      productId: params.id,
      rating,
      comment: comment.trim(),
      approved: false
    }
  });

  return NextResponse.json({ review, message: 'نظر شما ثبت شد و پس از تایید ادمین نمایش داده می‌شود' });
}
