const faqs = [
  { q: 'چگونه سفارش خود را پیگیری کنم؟', a: 'پس از ورود به حساب کاربری، از بخش «سفارش‌های من» می‌توانید وضعیت هر سفارش را مشاهده کنید.' },
  { q: 'هزینه ارسال چقدر است؟', a: 'برای خریدهای بالای ۵۰۰ هزار تومان ارسال رایگان است. در غیر این صورت هزینه ارسال در مرحله پرداخت محاسبه می‌شود.' },
  { q: 'آیا امکان مرجوع کردن کالا وجود دارد؟', a: 'بله، تمامی کالاها تا ۷ روز پس از تحویل قابل بازگشت هستند، مشروط بر اینکه استفاده نشده باشند.' },
  { q: 'روش‌های پرداخت چه هستند؟', a: 'در حال حاضر پرداخت آنلاین از طریق درگاه بانکی امکان‌پذیر است.' }
];

export const metadata = { title: 'سوالات متداول | مگامارکت' };

export default function FaqPage() {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>سوالات متداول</h1>
          <p>پاسخ سوالات پرتکرار مشتریان مگامارکت</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 60, maxWidth: 700 }}>
        {faqs.map((f, i) => (
          <div className="account-card" key={i}>
            <h3 style={{ marginBottom: 10 }}>{f.q}</h3>
            <p style={{ color: 'var(--text-light)', fontSize: 14 }}>{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
