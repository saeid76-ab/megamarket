import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getOrderById, statusLabels } from '@/lib/orders';
import { formatPrice } from '@/lib/format';
import AccountSidebar from '@/components/AccountSidebar';

export const metadata = { title: 'جزئیات سفارش | مگامارکت' };

function formatDate(date) {
  return new Date(date).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function optionsLabel(json) {
  try {
    const opts = JSON.parse(json || '{}');
    if (Object.keys(opts).length === 0) return null;
    return Object.entries(opts).map(([k, v]) => `${k}: ${v}`).join(' | ');
  } catch {
    return null;
  }
}

export default async function OrderDetailPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/account/orders/${params.id}`);

  const order = await getOrderById(params.id, user.id);
  if (!order) notFound();

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>جزئیات سفارش #{order.id.slice(-8).toUpperCase()}</h1>
          <p>ثبت‌شده در تاریخ {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 60 }}>
        <div className="account-layout">
          <AccountSidebar />

          <div>
            <div className="account-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0 }}>وضعیت سفارش</h3>
                <span className={`status-badge status-${order.status}`}>{statusLabels[order.status]}</span>
              </div>

              <div className="order-detail-items">
                {order.items.map((item) => {
                  const image = item.product?.images?.[0]?.url;
                  const opts = optionsLabel(item.selectedOptions);
                  return (
                    <div className="order-detail-item" key={item.id}>
                      {image && <img src={image} alt={item.productName} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: 14 }}>{item.productName}</div>
                        {opts && <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{opts}</div>}
                        <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>
                          {item.quantity.toLocaleString('fa-IR')} × {formatPrice(item.unitPrice)}
                        </div>
                      </div>
                      <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                        {formatPrice(item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="summary-divider" />
              <div className="summary-total">
                <span>جمع کل</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            <div className="account-card">
              <h3>اطلاعات ارسال</h3>
              <div className="pd-meta-item"><strong>گیرنده:</strong><span>{order.shippingName}</span></div>
              <div className="pd-meta-item"><strong>موبایل:</strong><span>{order.shippingPhone}</span></div>
              <div className="pd-meta-item"><strong>شهر:</strong><span>{order.shippingCity}</span></div>
              <div className="pd-meta-item"><strong>کد پستی:</strong><span>{order.shippingPostal}</span></div>
              <div className="pd-meta-item"><strong>آدرس:</strong><span>{order.shippingAddress}</span></div>
              {order.paymentRef && (
                <div className="pd-meta-item"><strong>کد پیگیری:</strong><span>{order.paymentRef}</span></div>
              )}
            </div>

            <Link href="/account/orders" className="back-btn" style={{ display: 'inline-flex' }}>
              → بازگشت به لیست سفارش‌ها
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
