'use client';

import { useState } from 'react';
import { useToast } from './ToastContext';

export default function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.newPassword.length < 8) {
      showToast('رمز عبور جدید باید حداقل ۸ کاراکتر باشد', 'error');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      showToast('رمز عبور جدید و تکرار آن یکسان نیستند', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'خطا در تغییر رمز عبور', 'error');
        return;
      }
      showToast('رمز عبور با موفقیت تغییر کرد', 'success');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      showToast('خطا در برقراری ارتباط با سرور', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>رمز عبور فعلی</label>
        <input
          type="password"
          className="form-input"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>رمز عبور جدید</label>
          <input
            type="password"
            className="form-input"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>تکرار رمز عبور جدید</label>
          <input
            type="password"
            className="form-input"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
        </div>
      </div>
      <button type="submit" className="submit-btn" style={{ maxWidth: 220 }} disabled={submitting}>
        {submitting ? 'در حال تغییر...' : 'تغییر رمز عبور'}
      </button>
    </form>
  );
}
