import Link from 'next/link';
import ProductForm from '@/components/ProductForm';

export const metadata = { title: 'افزودن محصول جدید | پنل ادمین' };

export default function NewProductPage() {
  return (
    <div>
      <div className="admin-header">
        <h2>افزودن محصول جدید</h2>
        <Link href="/admin/products" className="admin-btn outline">← بازگشت به لیست</Link>
      </div>
      <ProductForm />
    </div>
  );
}
