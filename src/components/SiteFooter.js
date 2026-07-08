'use client';

import Link from 'next/link';
import { useToast } from './ToastContext';

export default function SiteFooter() {
  const { showToast } = useToast();

  function handleNewsletter(e) {
    e.preventDefault();
    showToast('عضویت شما در خبرنامه ثبت شد', 'success');
    e.target.reset();
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-logo">
              <div className="logo-icon">MM</div>
              <h3>مگامارکت</h3>
            </div>
            <p>
              فروشگاه آنلاین مگامارکت با ارائه هزاران کالای متنوع از برندهای معتبر، تجربه
              خریدی آسان و مطمئن را برای شما فراهم می‌کند.
            </p>
            <div className="social-icons">
              <a href="#">📷</a>
              <a href="#">💬</a>
              <a href="#">📱</a>
              <a href="#">✈️</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>دسترسی سریع</h4>
            <ul>
              <li><Link href="/">صفحه اصلی</Link></li>
              <li><Link href="/products">محصولات</Link></li>
              <li><Link href="/#about">درباره ما</Link></li>
              <li><Link href="/contact">تماس با ما</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>خدمات مشتریان</h4>
            <ul>
              <li><Link href="/faq">سوالات متداول</Link></li>
              <li><a href="#">راهنمای خرید</a></li>
              <li><a href="#">شرایط بازگشت</a></li>
              <li><a href="#">حریم خصوصی</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>خبرنامه</h4>
            <p>برای دریافت آخرین تخفیف‌ها و محصولات جدید عضو شوید.</p>
            <form className="newsletter-form" onSubmit={handleNewsletter}>
              <input type="email" placeholder="ایمیل شما" required />
              <button type="submit">عضویت</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© ۱۴۰۵ مگامارکت. تمامی حقوق محفوظ است.</p>
          <div className="footer-badges">
            <span>🔒 پرداخت امن</span>
            <span>📦 ارسال سراسری</span>
            <span>✅ ضمانت اصالت</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
