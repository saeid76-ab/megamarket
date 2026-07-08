import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { finalPrice } from '@/lib/format';
import { requestPayment } from '@/lib/payment';

const schema = z.object({
  shippingName: z.string().min(3, 'نام گیرنده الزامی است'),
  shippingPhone: z.string().regex(/^09[0-9]{9}$/, 'شماره موبایل معتبر نیست'),
  shippingAddress: z.string().min(10, 'آدرس باید کامل وارد شود'),
  shippingCity: z.string().min(2, 'شهر الزامی است'),
  shippingPostal: z.string().min(5, 'کد پستی معتبر نیست'),
  paymentMethod: z.enum(['ONLINE', 'COD']).default('ONLINE'),
  notes: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
        selectedOptions: z.record(z.string()).optional()
      })
    )
    .min(1, 'سبد خرید خالی است')
});

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'برای ثبت سفارش ابتدا وارد حساب کاربری شوید' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { shippingName, shippingPhone, shippingAddress, shippingCity, shippingPostal, paymentMethod, notes, items } = parsed.data;

  // واکشی محصولات از دیتابیس برای محاسبه قیمت واقعی (هرگز به قیمت ارسالی از کلاینت اعتماد نمی‌کنیم)
  const productIds = items.map((it) => it.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let totalAmount = 0;
  const orderItemsData = [];

  for (const it of items) {
    const product = productMap.get(it.productId);
    if (!product) {
      return NextResponse.json({ error: 'یک یا چند محصول سبد خرید دیگر موجود نیست' }, { status: 400 });
    }
    if (product.stock < it.quantity) {
      return NextResponse.json(
        { error: `موجودی "${product.name}" کافی نیست (موجودی فعلی: ${product.stock})` },
        { status: 400 }
      );
    }
    const unitPrice = finalPrice(product.price, product.discount);
    totalAmount += unitPrice * it.quantity;
    orderItemsData.push({
      productId: product.id,
      productName: product.name,
      unitPrice,
      quantity: it.quantity,
      selectedOptions: JSON.stringify(it.selectedOptions || {})
    });
  }

  // هزینه ارسال
  const shippingCost = paymentMethod === 'COD' ? 50000 : (totalAmount >= 5000000 ? 0 : 250000);
  const finalTotal = totalAmount + shippingCost;

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: paymentMethod === 'COD' ? 'PROCESSING' : 'PENDING_PAYMENT',
      totalAmount: finalTotal,
      paymentMethod,
      notes: notes || null,
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingPostal,
      items: { create: orderItemsData }
    }
  });

  // برای پرداخت درب منزل نیازی به درگاه نیست
  if (paymentMethod === 'COD') {
    // کاهش موجودی همین‌جا انجام می‌شود
    for (const item of orderItemsData) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } }
      });
    }
    return NextResponse.json({
      orderId: order.id,
      paymentUrl: `/checkout/verify?orderId=${order.id}&authority=COD-${order.id}&status=success`
    });
  }

  const payment = await requestPayment({
    orderId: order.id,
    amount: totalAmount,
    description: `پرداخت سفارش ${order.id}`,
    callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/checkout/verify`
  });

  if (!payment.success) {
    return NextResponse.json({ error: 'خطا در ارتباط با درگاه پرداخت' }, { status: 502 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentRef: payment.authority }
  });

  return NextResponse.json({
    orderId: order.id,
    paymentUrl: payment.paymentUrl,
    authority: payment.authority
  });
}
