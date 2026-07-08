import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const products = await prisma.product.findMany({
    where: category && category !== 'all' ? { category: { slug: category } } : {},
    include: { images: true, category: true },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ products });
}
