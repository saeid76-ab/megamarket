import { prisma } from '@/lib/db';
import { formatPrice } from '@/lib/format';
import { statusLabels } from '@/lib/orders';
import AdminOrderStatusSelect from '@/components/AdminOrderStatusSelect';

export const metadata = { title: 'مدیریت سفارش‌ها | پنل ادمین' };

function formatDate(date) {
  return new Date(date).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { items: true, user: { select: { firstName: true, lastName: true, phone: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="admin-header">
        <h2>مدیریت سفارش‌ها</h2>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>شناسه سفارش</th>
              <th>مشتری</th>
              <th>تاریخ</th>
              <th>تعداد اقلام</th>
              <th>مبلغ کل</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id.slice(-8).toUpperCase()}</td>
                <td>
                  {order.user.firstName} {order.user.lastName}
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{order.user.phone}</div>
                </td>
                <td>{formatDate(order.createdAt)}</td>
                <td>{order.items.length.toLocaleString('fa-IR')}</td>
                <td>{formatPrice(order.totalAmount)}</td>
                <td>
                  <AdminOrderStatusSelect orderId={order.id} currentStatus={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
