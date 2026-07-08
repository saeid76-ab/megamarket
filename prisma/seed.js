// اسکریپت پر کردن دیتابیس با داده‌های اولیه
// اجرا: npm run db:seed

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const categories = [
  { slug: 'electronics', label: 'الکترونیک' },
  { slug: 'fashion', label: 'پوشاک' },
  { slug: 'home', label: 'لوازم خانگی' },
  { slug: 'beauty', label: 'زیبایی' },
  { slug: 'sports', label: 'ورزشی' }
];

// محصولات منتقل‌شده از نسخه‌ی اولیه‌ی استاتیک سایت
const products = [
  { slug: 'asus-vivobook', name: 'لپ‌تاپ ایسوس VivoBook', price: 28500000, discount: 15, soldCount: 342, category: 'electronics', ribbon: 'جدید', ribbonColor: 'gold', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/11a28e9a4-7a79-402e-bcb4-26a523513815.png', desc: 'لپ‌تاپ ایسوس VivoBook با پردازنده Intel Core i5، رم ۸ گیگابایت و حافظه SSD ۵۱۲ گیگابایت.', options: [{ label: 'رنگ', values: ['نقره‌ای', 'مشکی'] }], specs: ['پردازنده: Intel Core i5', 'رم: ۸ گیگابایت', 'حافظه: SSD ۵۱۲ گیگابایت', 'صفحه نمایش: ۱۵.۶ اینچ', 'وزن: ۱.۷ کیلوگرم', 'گارانتی: ۲۴ ماه'] },
  { slug: 'samsung-s24', name: 'گوشی سامسونگ Galaxy S24', price: 42000000, discount: 10, soldCount: 1248, category: 'electronics', ribbon: 'پرفروش', ribbonColor: '', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/1159a0daf-6fa7-4565-8089-1073d43ddff1.png', desc: 'گوشی سامسونگ Galaxy S24 با دوربین ۵۰ مگاپیکسل و صفحه نمایش AMOLED.', options: [{ label: 'رنگ', values: ['مشکی', 'سفید', 'بنفش'] }, { label: 'حافظه', values: ['۱۲۸ گیگ', '۲۵۶ گیگ'] }], specs: ['دوربین: ۵۰ مگاپیکسل', 'صفحه نمایش: ۶.۲ اینچ AMOLED', 'باتری: ۴۰۰۰ میلی‌آمپر', 'پردازنده: Snapdragon 8 Gen 3', 'رم: ۸ گیگابایت', 'گارانتی: ۱۸ ماه'] },
  { slug: 'lg-tv-55', name: 'تلویزیون ال‌جی ۵۵ اینچ', price: 18500000, discount: 25, soldCount: 523, category: 'electronics', ribbon: 'تخفیف ویژه', ribbonColor: 'green', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/1e3c7602b-984d-4059-b979-3eb955c759fa.png', desc: 'تلویزیون ال‌جی ۵۵ اینچ 4K Smart TV با کیفیت تصویر فوق‌العاده.', options: [{ label: 'سایز', values: ['۵۵ اینچ', '۶۵ اینچ'] }], specs: ['سایز: ۵۵ اینچ', 'رزولوشن: 4K UHD', 'سیستم عامل: webOS', 'HDR: Dolby Vision', 'پورت HDMI: ۴ عدد', 'گارانتی: ۲۴ ماه'] },
  { slug: 'nike-shoes', name: 'کفش ورزشی نایک', price: 3200000, discount: 30, soldCount: 2103, category: 'fashion', ribbon: 'حراج', ribbonColor: 'blue', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/124c4febe-a70b-4c9d-8d01-00a3413af498.png', desc: 'کفش ورزشی نایک با طراحی ارگونومیک و کفی طبی.', options: [{ label: 'سایز', values: ['۴۰', '۴۱', '۴۲', '۴۳', '۴۴'] }, { label: 'رنگ', values: ['مشکی', 'خاکستری'] }], specs: ['جنس رویه: مش تنفسی', 'جنس زیره: لاستیک مقاوم', 'کفی: طبی', 'وزن: ۲۸۰ گرم', 'مناسب برای: دویدن', 'گارانتی: ۶ ماه'] },
  { slug: 'mens-coat', name: 'کت رسمی مردانه', price: 4500000, discount: 20, soldCount: 456, category: 'fashion', ribbon: '', ribbonColor: '', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/1288b4125-81af-4bb7-9f27-30f1ad5cc7df.png', desc: 'کت رسمی مردانه با پارچه پشمی مرغوب و دوخت حرفه‌ای.', options: [{ label: 'سایز', values: ['M', 'L', 'XL', 'XXL'] }, { label: 'رنگ', values: ['سرمه‌ای', 'مشکی', 'خاکستری'] }], specs: ['جنس: پشم مرغوب', 'آستر: ابریشم', 'ساخت: ایتالیا', 'شستشو: خشک‌شویی', 'مناسب: رسمی', 'گارانتی: ۱۲ ماه'] },
  { slug: 'leather-bag', name: 'کیف چرم زنانه', price: 2800000, discount: 35, soldCount: 892, category: 'fashion', ribbon: 'فروش ویژه', ribbonColor: 'gold', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/1639aa19a-520a-4c89-bfd0-ee971d192925.png', desc: 'کیف چرم زنانه با طراحی شیک و جادار.', options: [{ label: 'رنگ', values: ['قهوه‌ای', 'مشکی', 'عسلی'] }], specs: ['جنس: چرم طبیعی', 'ابعاد: ۳۰×۲۰×۱۰ سانتی‌متر', 'تعداد جیب: ۳ عدد', 'بند: قابل تنظیم', 'ساخت: دست‌دوز', 'گارانتی: ۱۲ ماه'] },
  { slug: 'classic-watch', name: 'ساعت مچی کلاسیک', price: 5200000, discount: 18, soldCount: 654, category: 'fashion', ribbon: 'محبوب', ribbonColor: 'blue', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/115250317-6b85-422f-b507-f54d0f97f652.png', desc: 'ساعت مچی کلاسیک با بند چرمی و صفحه آبی.', options: [{ label: 'رنگ بند', values: ['قهوه‌ای', 'مشکی'] }], specs: ['جنس بدنه: استیل ضد زنگ', 'بند: چرم طبیعی', 'مقاومت در برابر آب: 5ATM', 'حرکت: کوارتز', 'قطر صفحه: ۴۲ میلی‌متر', 'گارانتی: ۲۴ ماه'] },
  { slug: 'rayban-sunglasses', name: 'عینک آفتابی ری‌بن', price: 1850000, discount: 40, soldCount: 1520, category: 'fashion', ribbon: 'بیشترین تخفیف', ribbonColor: 'green', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/1dce850c6-ebbc-4da0-ae48-1a7ad72fcce3.png', desc: 'عینک آفتابی ری‌بن با لنز پلاریزه و فریم فلزی.', options: [{ label: 'رنگ لنز', values: ['خاکستری', 'قهوه‌ای', 'سبز'] }], specs: ['نوع لنز: پلاریزه', 'محافظت: UV400', 'جنس فریم: فلز', 'وزن: ۲۵ گرم', 'همراه با کیف', 'گارانتی: ۱۲ ماه'] },
  { slug: 'philips-blender', name: 'مخلوط‌کن فیلیپس', price: 2400000, discount: 22, soldCount: 428, category: 'home', ribbon: '', ribbonColor: '', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/104368557-82ff-4fe5-98e6-69bc995f97e4.png', desc: 'مخلوط‌کن فیلیپس با قدرت ۱۰۰۰ وات و پارچ شیشه‌ای ۱.۵ لیتری.', options: [{ label: 'رنگ', values: ['مشکی', 'سفید'] }], specs: ['قدرت: ۱۰۰۰ وات', 'ظرفیت: ۱.۵ لیتر', 'جنس پارچ: شیشه', 'تیغه: استیل ضد زنگ', 'سرعت: ۵ حالت', 'گارانتی: ۲۴ ماه'] },
  { slug: 'bosch-iron', name: 'اتو بخار بوش', price: 1650000, discount: 28, soldCount: 734, category: 'home', ribbon: 'پیشنهاد ویژه', ribbonColor: 'gold', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/1f0ba6b31-1d72-4b09-9194-c83c01ba4f62.png', desc: 'اتو بخار بوش با قدرت ۲۴۰۰ وات و سیستم ضد رسوب.', options: [{ label: 'رنگ', values: ['نقره‌ای', 'مشکی'] }], specs: ['قدرت: ۲۴۰۰ وات', 'مخزن آب: ۳۰۰ میلی‌لیتر', 'سیستم: ضد رسوب', 'کف: سرامیکی', 'بخار: پیوسته', 'گارانتی: ۲۴ ماه'] },
  { slug: 'dior-perfume', name: 'عطر مردانه Dior', price: 3800000, discount: 12, soldCount: 987, category: 'beauty', ribbon: 'تخفیف استثنایی', ribbonColor: 'green', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/1a7f722d1-322d-4f60-a3c6-974e7c92dde7.png', desc: 'عطر مردانه Dior با رایحه چوبی و گرم. ماندگاری بالا.', options: [{ label: 'حجم', values: ['۵۰ میلی‌لیتر', '۱۰۰ میلی‌لیتر'] }], specs: ['حجم: ۱۰۰ میلی‌لیتر', 'نوع: Eau de Parfum', 'رایحه: چوبی گرم', 'ماندگاری: ۸ ساعت', 'ساخت: فرانسه', 'تاریخ انقضا: ۲۰۲۸'] },
  { slug: 'mountain-bike', name: 'دوچرخه کوهستان', price: 12500000, discount: 8, soldCount: 156, category: 'sports', ribbon: 'جدید', ribbonColor: 'gold', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/1ff23f93d-e4cf-43fd-be53-2bc753de0522.png', desc: 'دوچرخه کوهستان با فریم آلومینیومی و دنده ۲۱ سرعته.', options: [{ label: 'سایز', values: ['M', 'L', 'XL'] }, { label: 'رنگ', values: ['مشکی-قرمز', 'مشکی-آبی'] }], specs: ['فریم: آلومینیوم', 'دنده: ۲۱ سرعته Shimano', 'ترمز: دیسکی', 'سایز چرخ: ۲۷.۵ اینچ', 'وزن: ۱۳ کیلوگرم', 'گارانتی: ۲۴ ماه'] }
];

async function main() {
  console.log('در حال پاک‌سازی داده‌های قبلی...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('در حال ایجاد دسته‌بندی‌ها...');
  const categoryMap = {};
  for (const c of categories) {
    const created = await prisma.category.create({ data: c });
    categoryMap[c.slug] = created.id;
  }

  console.log('در حال ایجاد محصولات...');
  for (const p of products) {
    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.desc,
        price: p.price,
        discount: p.discount,
        soldCount: p.soldCount,
        stock: 100,
        ribbon: p.ribbon || null,
        ribbonColor: p.ribbonColor || null,
        specs: JSON.stringify(p.specs),
        options: JSON.stringify(p.options),
        categoryId: categoryMap[p.category],
        images: {
          create: [{ url: p.image }]
        }
      }
    });
  }

  console.log('در حال ایجاد کاربر ادمین پیش‌فرض...');
  const adminPasswordHash = await bcrypt.hash('Admin@1234', 10);
  await prisma.user.create({
    data: {
      firstName: 'مدیر',
      lastName: 'سیستم',
      email: 'admin@megamarket.ir',
      phone: '09120000000',
      passwordHash: adminPasswordHash,
      role: 'ADMIN'
    }
  });

  console.log('در حال ایجاد یک کاربر نمونه...');
  const userPasswordHash = await bcrypt.hash('User@1234', 10);
  await prisma.user.create({
    data: {
      firstName: 'سارا',
      lastName: 'محمدی',
      email: 'sara@example.com',
      phone: '09121234567',
      passwordHash: userPasswordHash,
      role: 'USER'
    }
  });

  console.log('✅ تکمیل شد!');
  console.log('---');
  console.log('ورود ادمین: admin@megamarket.ir / Admin@1234');
  console.log('ورود کاربر نمونه: sara@example.com / User@1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
