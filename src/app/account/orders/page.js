import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getOrdersForUser, statusLabels } from '@/lib/orders';
import { formatPrice, formatNumber } from '@/lib/format';
import AccountSidebar from '@/components/AccountSidebar';

export const metadata = { title: 'سفارش‌های من | مگامارکت' };

function formatDate(date) {
  return new Date(date).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/account/orders');

  const orders = await getOrdersForUser(user.id);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>سفارش‌های من</h1>
          <p>تاریخچه کامل خریدهای شما از مگامارکت</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 60 }}>
        <div className="account-layout">
          <AccountSidebar />

          <div className="account-card">
            <h3>لیست سفارش‌ها</h3>

            {orders.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📦</div>
                <p>شما هنوز سفارشی ثبت نکرده‌اید.</p>
                <Link href="/products" className="submit-btn" style={{ display: 'inline-block', marginTop: 15, maxWidth: 220 }}>
                  مشاهده محصولات
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <Link href={`/account/orders/${order.id}`} key={order.id} className="order-row" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="order-row-left">
                    <span className="order-id">سفارش #{order.id.slice(-8).toUpperCase()}</span>
                    <span className="order-date">{formatDate(order.createdAt)} • {order.items.length.toLocaleString('fa-IR')} قلم کالا</span>
                  </div>
                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                    <span className={`status-badge status-${order.status}`}>{statusLabels[order.status]}</span>
                    <span className="order-amount">{formatPrice(order.totalAmount)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
