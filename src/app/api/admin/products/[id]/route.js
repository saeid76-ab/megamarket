import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().min(5),
  price: z.number().int().positive(),
  discount: z.number().int().min(0).max(90),
  stock: z.number().int().min(0),
  categoryId: z.string().min(1),
  ribbon: z.string().optional().nullable(),
  ribbonColor: z.string().optional().nullable(),
  imageUrl: z.string().url(),
  specs: z.array(z.string()).default([]),
  options: z
    .array(
      z.object({
        label: z.string(),
        values: z.array(z.string())
      })
    )
    .default([])
});

export async function GET(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, category: true }
  });
  if (!product) return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const existingSlug = await prisma.product.findFirst({
    where: { slug: parsed.data.slug, id: { not: params.id } }
  });
  if (existingSlug) {
    return NextResponse.json({ error: 'این شناسه (slug) قبلاً برای محصول دیگری استفاده شده است' }, { status: 409 });
  }

  const { imageUrl, specs, options, ...rest } = parsed.data;

  // به‌روزرسانی تصویر اصلی: ساده‌ترین روش، حذف تصاویر قبلی و افزودن مجدد
  await prisma.productImage.deleteMany({ where: { productId: params.id } });

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      ...rest,
      specs: JSON.stringify(specs),
      options: JSON.stringify(options),
      images: { create: [{ url: imageUrl }] }
    },
    include: { images: true, category: true }
  });

  return NextResponse.json({ product });
}

export async function DELETE(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });

  const orderItemCount = await prisma.orderItem.count({ where: { productId: params.id } });
  if (orderItemCount > 0) {
    return NextResponse.json(
      { error: 'این محصول در سفارش‌های ثبت‌شده استفاده شده و قابل حذف نیست. می‌توانید موجودی آن را صفر کنید.' },
      { status: 409 }
    );
  }

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
