import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

const schema = z.object({
  name: z.string().min(2, 'نام محصول الزامی است'),
  slug: z.string().min(2, 'شناسه (slug) الزامی است').regex(/^[a-z0-9-]+$/, 'شناسه فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط فاصله باشد'),
  description: z.string().min(5, 'توضیحات الزامی است'),
  price: z.number().int().positive('قیمت باید عددی مثبت باشد'),
  discount: z.number().int().min(0).max(90),
  stock: z.number().int().min(0),
  categoryId: z.string().min(1, 'دسته‌بندی الزامی است'),
  ribbon: z.string().optional().nullable(),
  ribbonColor: z.string().optional().nullable(),
  imageUrl: z.string().url('آدرس تصویر معتبر نیست'),
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

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });

  const products = await prisma.product.findMany({
    include: { images: true, category: true },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ products });
}

export async function POST(request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const existingSlug = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (existingSlug) {
    return NextResponse.json({ error: 'این شناسه (slug) قبلاً استفاده شده است' }, { status: 409 });
  }

  const { imageUrl, specs, options, ...rest } = parsed.data;

  const product = await prisma.product.create({
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
