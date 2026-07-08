'use client';

import { useState } from 'react';
import { useToast } from '@/components/ToastContext';

export default function ContactPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  function handleSubmit(e) {
    e.preventDefault();
    showToast('پیام شما با موفقیت ارسال شد. به‌زودی پاسخ خواهیم داد.', 'success');
    setForm({ name: '', email: '', message: '' });
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>تماس با ما</h1>
          <p>سوالات و پیشنهادات خود را با ما در میان بگذارید</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 60, maxWidth: 700 }}>
        <div className="account-card">
          <h3>راه‌های ارتباطی</h3>
          <div className="pd-meta-item"><strong>تلفن:</strong><span>۰۲۱-۸۸۷۶۶۵۵</span></div>
          <div className="pd-meta-item"><strong>ایمیل:</strong><span>info@megamarket.ir</span></div>
          <div className="pd-meta-item"><strong>آدرس:</strong><span>تهران، خیابان ولیعصر</span></div>
        </div>

        <div className="account-card">
          <h3>فرم تماس</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>نام شما</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>ایمیل</label>
              <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>پیام</label>
              <textarea className="form-input" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </div>
            <button type="submit" className="submit-btn" style={{ maxWidth: 200 }}>ارسال پیام</button>
          </form>
        </div>
      </div>
    </div>
  );
}
