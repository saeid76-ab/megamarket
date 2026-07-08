# مگامارکت — فروشگاه آنلاین (Next.js)

این پروژه نسخه‌ی کامل و production-ready فروشگاه آنلاین مگامارکت است که با
Next.js 14 (App Router)، Prisma + SQLite و احراز هویت واقعی (bcrypt + JWT)
ساخته شده.

## امکانات

- ✅ ثبت‌نام / ورود واقعی با هش رمز عبور (bcrypt) و session مبتنی بر JWT (کوکی httpOnly)
- ✅ سبد خرید با persist در localStorage
- ✅ صفحه محصول با گالری، آپشن (رنگ/سایز)، تب‌های توضیحات/مشخصات/نظرات
- ✅ Checkout واقعی: ثبت سفارش در دیتابیس → اتصال به درگاه پرداخت (شبیه‌سازی‌شده، آماده اتصال به زرین‌پال) → کاهش موجودی پس از پرداخت موفق
- ✅ پروفایل کاربر (ویرایش اطلاعات، تغییر رمز عبور)
- ✅ تاریخچه و جزئیات سفارش‌ها
- ✅ پنل ادمین کامل: داشبورد آماری، مدیریت محصولات (افزودن/ویرایش/حذف)، مدیریت سفارش‌ها (تغییر وضعیت)
- ✅ محافظت مسیر `/admin` با middleware + بررسی نقش در سرور

## پیش‌نیاز

- Node.js نسخه ۱۸ یا بالاتر

## راه‌اندازی (اولین بار)

```bash
cd megamarket
npm install
npx prisma generate
npm run db:push
npm run db:seed
npm run dev
```

یا به‌صورت خلاصه:

```bash
npm run setup
npm run dev
```

سپس مرورگر را باز کنید: **http://localhost:3000**

## حساب‌های پیش‌فرض (بعد از seed)

| نقش | ایمیل | رمز عبور |
|---|---|---|
| ادمین | admin@megamarket.ir | Admin@1234 |
| کاربر عادی | sara@example.com | User@1234 |

برای ورود به پنل مدیریت، با حساب ادمین وارد شوید و به آدرس `/admin` بروید.

## ساختار پوشه‌ها

```
megamarket/
├── prisma/
│   ├── schema.prisma       # مدل دیتابیس
│   └── seed.js             # داده‌های اولیه
├── src/
│   ├── app/                # صفحات Next.js App Router
│   │   ├── page.js          # صفحه اصلی
│   │   ├── products/        # لیست و جزئیات محصول
│   │   ├── checkout/        # فرآیند پرداخت
│   │   ├── account/         # پروفایل و سفارش‌های کاربر
│   │   ├── admin/           # پنل مدیریت
│   │   └── api/             # تمام API Route ها
│   ├── components/          # کامپوننت‌های React
│   ├── lib/                 # توابع کمکی (db, auth, payment, ...)
│   └── middleware.js        # محافظت مسیر /admin
├── .env                     # متغیرهای محیطی
└── package.json
```

## اتصال درگاه پرداخت واقعی (زرین‌پال)

فایل `src/lib/payment.js` را ببینید. دو تابع `requestPayment` و
`verifyPayment` باید با فراخوانی API واقعی زرین‌پال جایگزین شوند:

1. در فایل `.env`، مقدار `PAYMENT_GATEWAY_MODE` را به `zarinpal` تغییر دهید و `ZARINPAL_MERCHANT_ID` را پر کنید.
2. در `requestPayment`، یک درخواست POST به
   `https://api.zarinpal.com/pg/v4/payment/request.json` بفرستید و کاربر را
   به `paymentUrl` که زرین‌پال برمی‌گرداند هدایت کنید.
3. در `verifyPayment`، یک درخواست POST به
   `https://api.zarinpal.com/pg/v4/payment/verify.json` بفرستید.

مستندات کامل: https://www.zarinpal.com/docs/paymentGateway/

## انتقال به دیتابیس production (اختیاری)

SQLite برای توسعه و پروژه‌های کوچک مناسب است. برای استقرار روی سرور با ترافیک
بالاتر، در `prisma/schema.prisma` مقدار `provider` را از `sqlite` به
`postgresql` تغییر دهید و `DATABASE_URL` را به آدرس دیتابیس واقعی (مثلاً از
Railway، Neon یا Supabase) تغییر دهید. سپس:

```bash
npx prisma db push
npm run db:seed
```

## دستورات مفید

| دستور | توضیح |
|---|---|
| `npm run dev` | اجرای محیط توسعه |
| `npm run build` | build برای production |
| `npm run start` | اجرای نسخه build شده |
| `npm run db:studio` | مشاهده/ویرایش دیتابیس با رابط گرافیکی Prisma Studio |
| `npm run db:seed` | پر کردن مجدد دیتابیس با داده‌های اولیه (داده‌های قبلی پاک می‌شوند) |

## نکات امنیتی پیش از انتشار عمومی

- مقدار `JWT_SECRET` در `.env` را به یک رشته‌ی تصادفی و طولانی تغییر دهید.
- از HTTPS استفاده کنید تا کوکی session با `secure: true` ارسال شود.
- محدودیت نرخ درخواست (rate limiting) برای فرم‌های ورود/ثبت‌نام اضافه کنید.
- اعتبارسنجی شماره موبایل را در صورت نیاز به ارسال OTP واقعی متصل کنید.
