import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🔍</div>
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>صفحه مورد نظر یافت نشد</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: 25 }}>
        ممکن است آدرس اشتباه باشد یا این صفحه حذف شده باشد.
      </p>
      <Link href="/" className="submit-btn" style={{ display: 'inline-block', maxWidth: 220 }}>
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}
