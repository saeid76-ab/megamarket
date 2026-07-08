'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastContext';

export default function AdminProductRowActions({ productId, productName }) {
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm(`آیا از حذف "${productName}" مطمئن هستید؟`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'خطا در حذف محصول', 'error');
        return;
      }
      showToast('محصول با موفقیت حذف شد', 'success');
      router.refresh();
    } catch {
      showToast('خطا در برقراری ارتباط با سرور', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Link href={`/admin/products/${productId}/edit`} className="admin-btn outline">ویرایش</Link>
      <button className="admin-btn danger" onClick={handleDelete} disabled={deleting}>
        {deleting ? '...' : 'حذف'}
      </button>
    </div>
  );
}
