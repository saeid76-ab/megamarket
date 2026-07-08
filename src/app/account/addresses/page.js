'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastContext';
import AccountSidebar from '@/components/AccountSidebar';

const empty = { label: 'خانه', fullName: '', phone: '', city: '', address: '', postal: '', isDefault: false };

export default function AddressesPage() {
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const res = await fetch('/api/account/addresses');
    const data = await res.json();
    setAddresses(data.addresses || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing(null); setForm(empty); setShowForm(true); }
  function openEdit(a) { setEditing(a); setForm({ label: a.label, fullName: a.fullName, phone: a.phone, city: a.city, address: a.address, postal: a.postal, isDefault: a.isDefault }); setShowForm(true); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.city || !form.address || !form.postal) {
      showToast('همه فیلدها را پر کنید', 'error'); return;
    }
    setSubmitting(true);
    try {
      const url = editing ? `/api/account/addresses/${editing.id}` : '/api/account/addresses';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'خطا در ذخیره آدرس', 'error'); return; }
      showToast(editing ? 'آدرس ویرایش شد' : 'آدرس جدید اضافه شد', 'success');
      setShowForm(false);
      load();
    } catch { showToast('خطا در ارتباط با سرور', 'error'); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id) {
    if (!confirm('آیا از حذف این آدرس مطمئن هستید؟')) return;
    const res = await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('آدرس حذف شد', 'success'); load(); }
  }

  return (
    <div>
      <div className="page-header"><div className="container"><h1>آدرس‌های من</h1><p>آدرس‌های پستی خود را مدیریت کنید</p></div></div>
      <div className="container" style={{ paddingBottom: 60 }}>
        <div className="account-layout">
          <AccountSidebar />
          <div>
            <div className="account-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0 }}>آدرس‌های ذخیره‌شده</h3>
                <button className="admin-btn primary" onClick={openNew}>+ افزودن آدرس جدید</button>
              </div>

              {loading ? <p style={{ color: 'var(--text-light)' }}>در حال بارگذاری...</p> : addresses.length === 0 ? (
                <div className="empty-state"><div className="icon">📍</div><p>هیچ آدرسی ثبت نشده است.</p></div>
              ) : addresses.map(a => (
                <div key={a.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12, position: 'relative', background: a.isDefault ? 'var(--primary-light)' : 'var(--white)' }}>
                  {a.isDefault && <span className="pd-badge success" style={{ position: 'absolute', top: 12, left: 12, fontSize: 11 }}>پیش‌فرض</span>}
                  <div style={{ fontWeight: 'bold', marginBottom: 6 }}>{a.label} — {a.fullName}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.8 }}>
                    📞 {a.phone}<br />
                    📍 {a.city} — {a.address}<br />
                    🏷 کد پستی: {a.postal}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="admin-btn outline" onClick={() => openEdit(a)}>ویرایش</button>
                    <button className="admin-btn danger" onClick={() => handleDelete(a.id)}>حذف</button>
                  </div>
                </div>
              ))}
            </div>

            {showForm && (
              <div className="account-card">
                <h3>{editing ? 'ویرایش آدرس' : 'افزودن آدرس جدید'}</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>عنوان آدرس</label>
                      <select className="form-input" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}>
                        <option>خانه</option><option>محل کار</option><option>منزل پدری</option><option>سایر</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>نام گیرنده <span className="required">*</span></label>
                      <input className="form-input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>شماره موبایل <span className="required">*</span></label>
                      <input className="form-input" placeholder="09123456789" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>شهر <span className="required">*</span></label>
                      <input className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>آدرس کامل <span className="required">*</span></label>
                    <textarea className="form-input" rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>کد پستی <span className="required">*</span></label>
                      <input className="form-input" value={form.postal} onChange={e => setForm({ ...form, postal: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
                      <label className="checkbox-group">
                        <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />
                        <span>تنظیم به عنوان آدرس پیش‌فرض</span>
                      </label>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="submit-btn" style={{ maxWidth: 180 }} disabled={submitting}>
                      {submitting ? 'در حال ذخیره...' : 'ذخیره آدرس'}
                    </button>
                    <button type="button" className="admin-btn outline" onClick={() => setShowForm(false)}>انصراف</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
