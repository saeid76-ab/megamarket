'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastContext';

const statusOptions = [
  { value: 'PENDING_PAYMENT', label: 'در انتظار پرداخت' },
  { value: 'PAID', label: 'پرداخت شده' },
  { value: 'PROCESSING', label: 'در حال پردازش' },
  { value: 'SHIPPED', label: 'ارسال شده' },
  { value: 'DELIVERED', label: 'تحویل داده شده' },
  { value: 'CANCELLED', label: 'لغو شده' }
];

export default function AdminOrderStatusSelect({ orderId, currentStatus }) {
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  async function handleChange(e) {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'خطا در تغییر وضعیت', 'error');
        setStatus(currentStatus);
        return;
      }
      showToast('وضعیت سفارش به‌روزرسانی شد', 'success');
      router.refresh();
    } catch {
      showToast('خطا در برقراری ارتباط با سرور', 'error');
      setStatus(currentStatus);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <select className="form-input" style={{ padding: '6px 10px', fontSize: 13 }} value={status} onChange={handleChange} disabled={updating}>
      {statusOptions.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
