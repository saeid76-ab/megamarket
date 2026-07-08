import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import ProductForm from '@/components/ProductForm';

export const metadata = { title: 'ویرایش محصول | پنل ادمین' };

export default async function EditProductPage({ params }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true, category: true }
  });

  if (!product) notFound();

  return (
    <div>
      <div className="admin-header">
        <h2>ویرایش محصول: {product.name}</h2>
        <Link href="/admin/products" className="admin-btn outline">← بازگشت به لیست</Link>
      </div>
      <ProductForm initialProduct={product} />
    </div>
  );
}
