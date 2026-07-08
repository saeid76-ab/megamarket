'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from './UserContext';
import { useToast } from './ToastContext';

export default function ProfileForm({ user }) {
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    defaultAddress: user.defaultAddress || '',
    defaultCity: user.defaultCity || '',
    defaultPostal: user.defaultPostal || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useUser();
  const { showToast } = useToast();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.firstName.trim().length < 2 || form.lastName.trim().length < 2) {
      showToast('نام و نام خانوادگی را کامل وارد کنید', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'خطا در به‌روزرسانی پروفایل', 'error');
        return;
      }
      setUser(data.user);
      showToast('پروفایل با موفقیت به‌روزرسانی شد', 'success');
      router.refresh();
    } catch {
      showToast('خطا در برقراری ارتباط با سرور', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>نام</label>
          <input className="form-input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </div>
        <div className="form-group">
          <label>نام خانوادگی</label>
          <input className="form-input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>ایمیل (غیرقابل تغییر)</label>
          <input className="form-input" value={user.email} disabled style={{ background: 'var(--bg-alt)', color: 'var(--text-light)' }} />
        </div>
        <div className="form-group">
          <label>شماره موبایل (غیرقابل تغییر)</label>
          <input className="form-input" value={user.phone} disabled style={{ background: 'var(--bg-alt)', color: 'var(--text-light)' }} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>شهر پیش‌فرض</label>
          <input className="form-input" value={form.defaultCity} onChange={(e) => setForm({ ...form, defaultCity: e.target.value })} />
        </div>
        <div className="form-group">
          <label>کد پستی پیش‌فرض</label>
          <input className="form-input" value={form.defaultPostal} onChange={(e) => setForm({ ...form, defaultPostal: e.target.value })} />
        </div>
      </div>

      <div className="form-group">
        <label>آدرس پیش‌فرض</label>
        <textarea
          className="form-input"
          rows={3}
          value={form.defaultAddress}
          onChange={(e) => setForm({ ...form, defaultAddress: e.target.value })}
        />
      </div>

      <button type="submit" className="submit-btn" style={{ maxWidth: 220 }} disabled={submitting}>
        {submitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
      </button>
    </form>
  );
}
