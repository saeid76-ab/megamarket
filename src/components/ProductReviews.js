'use client';

import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { useToast } from './ToastContext';

const stars = [1, 2, 3, 4, 5];

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4, fontSize: 24, cursor: 'pointer', marginBottom: 10 }}>
      {stars.map(s => (
        <span key={s} style={{ color: (hover || value) >= s ? '#F59E0B' : 'var(--border)', transition: 'color 0.1s' }}
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => onChange(s)}>★</span>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }) {
  const { user } = useUser();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadReviews() {
    const res = await fetch(`/api/products/${productId}/reviews`);
    const data = await res.json();
    setReviews(data.reviews || []);
    setLoading(false);
  }

  useEffect(() => { loadReviews(); }, [productId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) { showToast('برای ثبت نظر ابتدا وارد حساب کاربری شوید', 'error'); return; }
    if (rating === 0) { showToast('لطفاً امتیاز را انتخاب کنید', 'error'); return; }
    if (comment.trim().length < 5) { showToast('متن نظر باید حداقل ۵ کاراکتر باشد', 'error'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error, 'error'); return; }
      showToast('نظر شما ثبت شد و پس از تایید ادمین نمایش داده می‌شود ✅', 'success');
      setRating(0); setComment('');
    } catch { showToast('خطا در ارتباط با سرور', 'error'); }
    finally { setSubmitting(false); }
  }

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div>
      {/* خلاصه امتیاز */}
      {reviews.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 42, fontWeight: 'bold', color: 'var(--text)' }}>{avgRating}</div>
            <div style={{ color: '#F59E0B', fontSize: 18 }}>{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</div>
            <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{reviews.length.toLocaleString('fa-IR')} نظر</div>
          </div>
        </div>
      )}

      {/* لیست نظرات */}
      {loading ? <p style={{ color: 'var(--text-light)' }}>در حال بارگذاری...</p>
        : reviews.length === 0 ? <p style={{ color: 'var(--text-light)', padding: '16px 0' }}>هنوز نظری ثبت نشده است. اولین نفر باشید!</p>
        : reviews.map(r => (
          <div key={r.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <strong style={{ color: 'var(--text)' }}>{r.user.firstName} {r.user.lastName}</strong>
              <span style={{ fontSize: 12, color: 'var(--text-lighter)' }}>
                {new Date(r.createdAt).toLocaleDateString('fa-IR')}
              </span>
            </div>
            <div style={{ color: '#F59E0B', marginBottom: 6 }}>
              {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-light)' }}>{r.comment}</p>
          </div>
        ))
      }

      {/* فرم ثبت نظر */}
      <div style={{ marginTop: 24, padding: 20, background: 'var(--bg-alt)', borderRadius: 10, border: '1px solid var(--border)' }}>
        <h4 style={{ marginBottom: 14 }}>نظر خود را بنویسید</h4>
        {!user ? (
          <p style={{ fontSize: 14, color: 'var(--text-light)' }}>برای ثبت نظر باید <a href="/login" style={{ color: 'var(--primary)' }}>وارد حساب کاربری</a> شوید.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: 'var(--text)', display: 'block', marginBottom: 6 }}>امتیاز شما</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div className="form-group">
              <label>متن نظر</label>
              <textarea className="form-input" rows={4} placeholder="تجربه خود از این محصول را بنویسید..." value={comment} onChange={e => setComment(e.target.value)} />
            </div>
            <button type="submit" className="submit-btn" style={{ maxWidth: 180 }} disabled={submitting}>
              {submitting ? 'در حال ثبت...' : 'ثبت نظر'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
