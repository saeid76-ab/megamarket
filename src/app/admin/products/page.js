import Link from 'next/link';
import { prisma } from '@/lib/db';
import { formatPrice } from '@/lib/format';
import AdminProductRowActions from '@/components/AdminProductRowActions';

export const metadata = { title: 'مدیریت محصولات | پنل ادمین' };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { images: true, category: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="admin-header">
        <h2>مدیریت محصولات</h2>
        <Link href="/admin/products/new" className="admin-btn primary">+ افزودن محصول جدید</Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>تصویر</th>
              <th>نام محصول</th>
              <th>دسته‌بندی</th>
              <th>قیمت</th>
              <th>تخفیف</th>
              <th>موجودی</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td><img src={p.images[0]?.url} alt={p.name} /></td>
                <td>{p.name}</td>
                <td>{p.category?.label}</td>
                <td>{formatPrice(p.price)}</td>
                <td>{p.discount > 0 ? `${p.discount}٪` : '—'}</td>
                <td>
                  <span style={{ color: p.stock <= 5 ? 'var(--danger)' : 'var(--text)' }}>
                    {p.stock.toLocaleString('fa-IR')}
                  </span>
                </td>
                <td>
                  <AdminProductRowActions productId={p.id} productName={p.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
