'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import { useUser } from '@/components/UserContext';
import { useToast } from '@/components/ToastContext';
import { formatPrice } from '@/lib/format';

function validatePhone(p) { return /^09[0-9]{9}$/.test(p); }

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useUser();
  const { showToast } = useToast();
  const router = useRouter();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [notes, setNotes] = useState('');
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [form, setForm] = useState({ shippingName: '', shippingPhone: '', shippingAddress: '', shippingCity: '', shippingPostal: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (user) {
      setForm(f => ({ ...f, shippingName: `${user.firstName} ${user.lastName}`, shippingPhone: user.phone || '' }));
      fetch('/api/account/addresses').then(r => r.json()).then(d => {
        const addrs = d.addresses || [];
        setAddresses(addrs);
        const def = addrs.find(a => a.isDefault) || addrs[0];
        if (def) { setSelectedAddressId(def.id); setUseNewAddress(false); }
        else setUseNewAddress(true);
      });
    }
  }, [user]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.push('/login?redirect=/checkout');
    else if (items.length === 0) router.push('/products');
  }, [hydrated, user, items, router]);

  const shippingCost = paymentMethod === 'COD' ? 50000 : (totalAmount >= 5000000 ? 0 : 250000);
  const finalTotal = totalAmount + shippingCost;

  function getShippingData() {
    if (!useNewAddress && selectedAddressId) {
      const a = addresses.find(x => x.id === selectedAddressId);
      if (a) return { shippingName: a.fullName, shippingPhone: a.phone, shippingAddress: a.address, shippingCity: a.city, shippingPostal: a.postal };
    }
    return form;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const shipping = getShippingData();
    const errs = {};
    if (!shipping.shippingName?.trim() || shipping.shippingName.trim().length < 3) errs.shippingName = 'نام گیرنده را کامل وارد کنید';
    if (!validatePhone(shipping.shippingPhone?.trim())) errs.shippingPhone = 'شماره موبایل معتبر نیست';
    if (!shipping.shippingAddress?.trim() || shipping.shippingAddress.trim().length < 10) errs.shippingAddress = 'آدرس را کامل‌تر وارد کنید';
    if (!shipping.shippingCity?.trim()) errs.shippingCity = 'شهر الزامی است';
    if (!shipping.shippingPostal?.trim() || shipping.shippingPostal.trim().length < 5) errs.shippingPostal = 'کد پستی معتبر نیست';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...shipping,
          paymentMethod,
          notes,
          items: items.map(it => ({ productId: it.productId, quantity: it.quantity, selectedOptions: it.selectedOptions }))
        })
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'خطا در ثبت سفارش', 'error'); return; }
      clearCart();
      router.push(data.paymentUrl);
    } catch { showToast('خطا در ارتباط با سرور', 'error'); }
    finally { setSubmitting(false); }
  }

  if (!hydrated || !user || items.length === 0) return <div className="container" style={{ padding: '60px 0' }} />;

  return (
    <div>
      <div className="page-header"><div className="container"><h1>تکمیل خرید</h1><p>اطلاعات ارسال را تکمیل کرده و به مرحله پرداخت بروید</p></div></div>
      <div className="container" style={{ paddingBottom: 60 }}>
        <form onSubmit={handleSubmit}>
          <div className="checkout-layout">
            <div>
              {/* انتخاب آدرس */}
              <div className="checkout-step">
                <h3><span className="step-num">۱</span> آدرس تحویل</h3>

                {addresses.length > 0 && (
                  <>
                    <div style={{ marginBottom: 14 }}>
                      {addresses.map(a => (
                        <div key={a.id} onClick={() => { setSelectedAddressId(a.id); setUseNewAddress(false); }}
                          style={{ border: `2px solid ${!useNewAddress && selectedAddressId === a.id ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 10, padding: 14, marginBottom: 10, cursor: 'pointer', background: !useNewAddress && selectedAddressId === a.id ? 'var(--primary-light)' : 'var(--white)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>{a.label} — {a.fullName}</strong>
                            {a.isDefault && <span style={{ fontSize: 11, color: 'var(--accent)' }}>پیش‌فرض</span>}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>{a.city} — {a.address} — کد پستی: {a.postal}</div>
                        </div>
                      ))}
                    </div>
                    <button type="button" className="admin-btn outline" style={{ marginBottom: 16 }} onClick={() => { setUseNewAddress(v => !v); setSelectedAddressId(null); }}>
                      {useNewAddress ? '← برگشت به آدرس‌های ذخیره‌شده' : '+ استفاده از آدرس جدید'}
                    </button>
                  </>
                )}

                {(useNewAddress || addresses.length === 0) && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>نام گیرنده <span className="required">*</span></label>
                        <input className={`form-input ${errors.shippingName ? 'error' : ''}`} value={form.shippingName} onChange={e => setForm({ ...form, shippingName: e.target.value })} />
                        {errors.shippingName && <div className="form-error show">{errors.shippingName}</div>}
                      </div>
                      <div className="form-group">
                        <label>شماره موبایل <span className="required">*</span></label>
                        <input className={`form-input ${errors.shippingPhone ? 'error' : ''}`} placeholder="09123456789" value={form.shippingPhone} onChange={e => setForm({ ...form, shippingPhone: e.target.value })} />
                        {errors.shippingPhone && <div className="form-error show">{errors.shippingPhone}</div>}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>شهر <span className="required">*</span></label>
                        <input className={`form-input ${errors.shippingCity ? 'error' : ''}`} value={form.shippingCity} onChange={e => setForm({ ...form, shippingCity: e.target.value })} />
                        {errors.shippingCity && <div className="form-error show">{errors.shippingCity}</div>}
                      </div>
                      <div className="form-group">
                        <label>کد پستی <span className="required">*</span></label>
                        <input className={`form-input ${errors.shippingPostal ? 'error' : ''}`} value={form.shippingPostal} onChange={e => setForm({ ...form, shippingPostal: e.target.value })} />
                        {errors.shippingPostal && <div className="form-error show">{errors.shippingPostal}</div>}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>آدرس کامل <span className="required">*</span></label>
                      <textarea className={`form-input ${errors.shippingAddress ? 'error' : ''}`} rows={3} value={form.shippingAddress} onChange={e => setForm({ ...form, shippingAddress: e.target.value })} />
                      {errors.shippingAddress && <div className="form-error show">{errors.shippingAddress}</div>}
                    </div>
                  </>
                )}
              </div>

              {/* روش پرداخت */}
              <div className="checkout-step">
                <h3><span className="step-num">۲</span> روش پرداخت</h3>
                <div className={`payment-method ${paymentMethod === 'ONLINE' ? 'selected' : ''}`} onClick={() => setPaymentMethod('ONLINE')}>
                  <input type="radio" readOnly checked={paymentMethod === 'ONLINE'} style={{ marginLeft: 8 }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>💳 پرداخت آنلاین (درگاه بانکی)</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>ارسال رایگان برای خرید بالای ۵۰۰ هزار تومان</div>
                  </div>
                </div>
                <div className={`payment-method ${paymentMethod === 'COD' ? 'selected' : ''}`} onClick={() => setPaymentMethod('COD')}>
                  <input type="radio" readOnly checked={paymentMethod === 'COD'} style={{ marginLeft: 8 }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>🚪 پرداخت درب منزل (کارتخوان)</div>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>هزینه ارسال اضافه: ۵۰,۰۰۰ تومان</div>
                  </div>
                </div>
              </div>

              {/* یادداشت */}
              <div className="checkout-step">
                <h3><span className="step-num">۳</span> یادداشت برای سفارش (اختیاری)</h3>
                <textarea className="form-input" rows={3} placeholder="اگر توضیحی برای سفارش دارید اینجا بنویسید..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>

            {/* خلاصه سفارش */}
            <div className="summary-box">
              <h3 style={{ marginBottom: 16 }}>خلاصه سفارش</h3>
              {items.map((it, idx) => (
                <div className="summary-item" key={idx}>
                  <span>{it.name} × {it.quantity.toLocaleString('fa-IR')}</span>
                  <span>{formatPrice(it.unitPrice * it.quantity)}</span>
                </div>
              ))}
              <div className="summary-divider" />
              <div className="summary-item"><span>جمع کالاها</span><span>{formatPrice(totalAmount)}</span></div>
              <div className="summary-item">
                <span>هزینه ارسال</span>
                <span style={{ color: shippingCost === 0 ? 'var(--accent)' : 'var(--text)' }}>
                  {shippingCost === 0 ? '🎁 رایگان' : formatPrice(shippingCost)}
                </span>
              </div>
              {paymentMethod === 'COD' && <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 8 }}>✓ پرداخت درب منزل</div>}
              <div className="summary-divider" />
              <div className="summary-total"><span>مبلغ قابل پرداخت</span><span>{formatPrice(finalTotal)}</span></div>
              <button type="submit" className="checkout-btn" style={{ marginTop: 20 }} disabled={submitting}>
                {submitting ? 'در حال انتقال...' : paymentMethod === 'COD' ? '✅ ثبت سفارش' : '💳 انتقال به درگاه پرداخت'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
