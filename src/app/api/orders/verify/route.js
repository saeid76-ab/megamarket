import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { verifyPayment } from '@/lib/payment';

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });
  }

  const { orderId, authority } = await request.json();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });

  if (!order || order.userId !== user.id) {
    return NextResponse.json({ error: 'سفارش یافت نشد' }, { status: 404 });
  }

  if (order.status === 'PAID' || order.status === 'PROCESSING') {
    // قبلاً تایید شده - برای جلوگیری از پردازش دوباره
    return NextResponse.json({ success: true, orderId: order.id, alreadyProcessed: true });
  }

  const result = await verifyPayment({ authority, amount: order.totalAmount });

  if (!result.success) {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
    return NextResponse.json({ error: 'پرداخت تایید نشد یا توسط کاربر لغو شد', success: false }, { status: 400 });
  }

  // به‌روزرسانی موجودی و تعداد فروش محصولات
  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: { decrement: item.quantity },
        soldCount: { increment: item.quantity }
      }
    });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'PAID', paymentRef: result.refId }
  });

  return NextResponse.json({ success: true, orderId: order.id, refId: result.refId });
}
