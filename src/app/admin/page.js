import { prisma } from '@/lib/db';
import { formatPrice } from '@/lib/format';

export default async function AdminDashboard() {
  const [productCount, orderCount, userCount, revenueAgg] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.order.aggregate({
      where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
      _sum: { totalAmount: true }
    })
  ]);

  const pendingOrders = await prisma.order.count({ where: { status: 'PENDING_PAYMENT' } });
  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { lte: 5 } },
    select: { id: true, name: true, stock: true },
    take: 5
  });

  const totalRevenue = revenueAgg._sum.totalAmount || 0;

  return (
    <div>
      <div className="admin-header">
        <h2>داشبورد مدیریت</h2>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="lbl">تعداد محصولات</div>
          <div className="num">{productCount.toLocaleString('fa-IR')}</div>
        </div>
        <div className="admin-stat-card">
          <div className="lbl">کل سفارش‌ها</div>
          <div className="num">{orderCount.toLocaleString('fa-IR')}</div>
        </div>
        <div className="admin-stat-card">
          <div className="lbl">تعداد کاربران</div>
          <div className="num">{userCount.toLocaleString('fa-IR')}</div>
        </div>
        <div className="admin-stat-card">
          <div className="lbl">درآمد کل (موفق)</div>
          <div className="num" style={{ fontSize: 18 }}>{formatPrice(totalRevenue)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="admin-table-wrap" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 12, fontSize: 15 }}>⏳ سفارش‌های در انتظار پرداخت</h3>
          <p style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--primary)' }}>{pendingOrders.toLocaleString('fa-IR')}</p>
        </div>
        <div className="admin-table-wrap" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 12, fontSize: 15 }}>⚠️ محصولات با موجودی کم</h3>
          {lowStockProducts.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-light)' }}>همه محصولات موجودی کافی دارند.</p>
          ) : (
            <ul style={{ fontSize: 13 }}>
              {lowStockProducts.map((p) => (
                <li key={p.id} style={{ marginBottom: 6, listStyle: 'disc', marginRight: 18 }}>
                  {p.name} — موجودی: {p.stock.toLocaleString('fa-IR')}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
