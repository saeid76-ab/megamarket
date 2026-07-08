'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/format';

export default function MockGatewayPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const authority = searchParams.get('authority');
  const orderId = searchParams.get('orderId');
  const amount = Number(searchParams.get('amount') || 0);

  function goToCallback(status) {
    setLoading(true);
    router.push(`/checkout/verify?orderId=${orderId}&authority=${authority}&status=${status}`);
  }

  return (
    <div className="container">
      <div className="gateway-box">
        <div className="logo-icon" style={{ width: 64, height: 64, fontSize: 22 }}>بانک</div>
        <h2>درگاه پرداخت شبیه‌سازی‌شده</h2>
        <p style={{ color: 'var(--text-light)', marginTop: 10, fontSize: 13 }}>
          این یک محیط آزمایشی است. در نسخه نهایی این صفحه با درگاه واقعی بانکی (مثل زرین‌پال) جایگزین می‌شود.
        </p>
        <div className="gateway-amount">{formatPrice(amount)}</div>
        <p style={{ fontSize: 12, color: 'var(--text-lighter)' }}>شناسه تراکنش: {authority}</p>

        <div className="gateway-actions">
          <button className="gateway-pay-btn" onClick={() => goToCallback('success')} disabled={loading}>
            ✅ پرداخت موفق (شبیه‌سازی)
          </button>
          <button className="gateway-cancel-btn" onClick={() => goToCallback('cancel')} disabled={loading}>
            ❌ انصراف از پرداخت
          </button>
        </div>
      </div>
    </div>
  );
}
