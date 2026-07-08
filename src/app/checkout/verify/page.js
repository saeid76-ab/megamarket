'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | failed
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const oId = searchParams.get('orderId');
    const authority = searchParams.get('authority');
    const gatewayStatus = searchParams.get('status');
    setOrderId(oId);

    if (gatewayStatus === 'cancel') {
      setStatus('failed');
      setMessage('پرداخت توسط شما لغو شد.');
      return;
    }

    fetch('/api/orders/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: oId, authority })
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok && data.success) {
          setStatus('success');
        } else {
          setStatus('failed');
          setMessage(data.error || 'پرداخت تایید نشد.');
        }
      })
      .catch(() => {
        setStatus('failed');
        setMessage('خطا در ارتباط با سرور.');
      });
  }, [searchParams]);

  return (
    <div className="container">
      <div className="gateway-box">
        {status === 'loading' && (
          <>
            <div className="logo-icon" style={{ width: 64, height: 64, fontSize: 28 }}>⏳</div>
            <h2>در حال بررسی نتیجه پرداخت...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="logo-icon" style={{ width: 64, height: 64, fontSize: 28, background: 'var(--accent)' }}>✓</div>
            <h2>پرداخت با موفقیت انجام شد</h2>
            <p style={{ color: 'var(--text-light)', marginTop: 10 }}>سفارش شما ثبت شد و به‌زودی پردازش می‌شود.</p>
            <div className="gateway-actions">
              <Link href={`/account/orders/${orderId}`} className="gateway-pay-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                مشاهده سفارش
              </Link>
              <Link href="/" className="gateway-cancel-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                بازگشت به فروشگاه
              </Link>
            </div>
          </>
        )}
        {status === 'failed' && (
          <>
            <div className="logo-icon" style={{ width: 64, height: 64, fontSize: 28, background: 'var(--danger)' }}>✕</div>
            <h2>پرداخت ناموفق بود</h2>
            <p style={{ color: 'var(--text-light)', marginTop: 10 }}>{message}</p>
            <div className="gateway-actions">
              <Link href="/checkout" className="gateway-cancel-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                تلاش مجدد
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
