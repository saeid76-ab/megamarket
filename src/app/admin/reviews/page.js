'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const router = useRouter();

  async function load() {
    const res = await fetch('/api/admin/reviews');
    const data = await res.json();
    setReviews(data.reviews || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleApprove(id, approved) {
    const res = await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId: id, approved })
    });
    if (res.ok) { showToast(approved ? 'نظر تایید شد' : 'نظر رد شد', 'success'); load(); }
  }

  async function handleDelete(id) {
    if (!confirm('آیا از حذف این نظر مطمئن هستید؟')) return;
    const res = await fetch('/api/admin/reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId: id })
    });
    if (res.ok) { showToast('نظر حذف شد', 'success'); load(); }
  }

  const pending = reviews.filter(r => !r.approved);
  const approved = reviews.filter(r => r.approved);

  return (
    <div>
      <div className="admin-header"><h2>مدیریت نظرات کاربران</h2></div>

      {loading ? <p>در حال بارگذاری...</p> : (
        <>
          {pending.length > 0 && (
            <div style={{ marginBottom: 30 }}>
              <h3 style={{ marginBottom: 14, fontSize: 16, color: 'var(--danger)' }}>⏳ در انتظار تایید ({pending.length})</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>کاربر</th><th>محصول</th><th>امتیاز</th><th>نظر</th><th>تاریخ</th><th>عملیات</th></tr></thead>
                  <tbody>
                    {pending.map(r => (
                      <tr key={r.id}>
                        <td>{r.user.firstName} {r.user.lastName}</td>
                        <td>{r.product.name}</td>
                        <td>{'★'.repeat(r.rating)}</td>
                        <td style={{ maxWidth: 200 }}>{r.comment}</td>
                        <td>{new Date(r.createdAt).toLocaleDateString('fa-IR')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="admin-btn primary" onClick={() => handleApprove(r.id, true)}>تایید</button>
                            <button className="admin-btn danger" onClick={() => handleDelete(r.id)}>حذف</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <h3 style={{ marginBottom: 14, fontSize: 16, color: 'var(--accent)' }}>✅ نظرات تایید شده ({approved.length})</h3>
            {approved.length === 0 ? <p style={{ color: 'var(--text-light)' }}>نظر تایید شده‌ای وجود ندارد.</p> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>کاربر</th><th>محصول</th><th>امتیاز</th><th>نظر</th><th>عملیات</th></tr></thead>
                  <tbody>
                    {approved.map(r => (
                      <tr key={r.id}>
                        <td>{r.user.firstName} {r.user.lastName}</td>
                        <td>{r.product.name}</td>
                        <td>{'★'.repeat(r.rating)}</td>
                        <td style={{ maxWidth: 200 }}>{r.comment}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="admin-btn outline" onClick={() => handleApprove(r.id, false)}>رد کردن</button>
                            <button className="admin-btn danger" onClick={() => handleDelete(r.id)}>حذف</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
