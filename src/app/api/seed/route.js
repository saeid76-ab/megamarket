import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== 'run-seed-2026') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    // پاک کردن داده‌های قبلی
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // دسته‌بندی‌ها
    const cats = await Promise.all([
      prisma.category.create({ data: { slug: 'electronics', label: 'الکترونیک' } }),
      prisma.category.create({ data: { slug: 'fashion', label: 'پوشاک' } }),
      prisma.category.create({ data: { slug: 'home', label: 'لوازم خانگی' } }),
      prisma.category.create({ data: { slug: 'beauty', label: 'زیبایی' } }),
      prisma.category.create({ data: { slug: 'sports', label: 'ورزشی' } }),
    ]);

    const catMap = {};
    cats.forEach(c => catMap[c.slug] = c.id);

    // محصولات
    const products = [
      { slug: 'asus-vivobook', name: 'لپ‌تاپ ایسوس VivoBook', price: 28500000, discount: 15, soldCount: 342, category: 'electronics', ribbon: 'جدید', ribbonColor: 'gold', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/11a28e9a4-7a79-402e-bcb4-26a523513815.png', desc: 'لپ‌تاپ ایسوس VivoBook با پردازنده Intel Core i5', specs: ['پردازنده: Intel Core i5', 'رم: ۸ گیگابایت'], options: [{ label: 'رنگ', values: ['نقره‌ای', 'مشکی'] }] },
      { slug: 'samsung-s24', name: 'گوشی سامسونگ Galaxy S24', price: 42000000, discount: 10, soldCount: 1248, category: 'electronics', ribbon: 'پرفروش', ribbonColor: '', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/1159a0daf-6fa7-4565-8089-1073d43ddff1.png', desc: 'گوشی سامسونگ Galaxy S24 با دوربین ۵۰ مگاپیکسل', specs: ['دوربین: ۵۰ مگاپیکسل', 'باتری: ۴۰۰۰ میلی‌آمپر'], options: [{ label: 'رنگ', values: ['مشکی', 'سفید'] }] },
      { slug: 'lg-tv-55', name: 'تلویزیون ال‌جی ۵۵ اینچ', price: 18500000, discount: 25, soldCount: 523, category: 'electronics', ribbon: 'تخفیف ویژه', ribbonColor: 'green', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/1e3c7602b-984d-4059-b979-3eb955c759fa.png', desc: 'تلویزیون ال‌جی ۵۵ اینچ 4K Smart TV', specs: ['سایز: ۵۵ اینچ', 'رزولوشن: 4K'], options: [{ label: 'سایز', values: ['۵۵ اینچ', '۶۵ اینچ'] }] },
      { slug: 'nike-shoes', name: 'کفش ورزشی نایک', price: 3200000, discount: 30, soldCount: 2103, category: 'fashion', ribbon: 'حراج', ribbonColor: 'blue', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/124c4febe-a70b-4c9d-8d01-00a3413af498.png', desc: 'کفش ورزشی نایک با طراحی ارگونومیک', specs: ['جنس رویه: مش تنفسی', 'کفی: طبی'], options: [{ label: 'سایز', values: ['۴۰', '۴۱', '۴۲', '۴۳'] }] },
      { slug: 'leather-bag', name: 'کیف چرم زنانه', price: 2800000, discount: 35, soldCount: 892, category: 'fashion', ribbon: 'فروش ویژه', ribbonColor: 'gold', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/1639aa19a-520a-4c89-bfd0-ee971d192925.png', desc: 'کیف چرم زنانه با طراحی شیک', specs: ['جنس: چرم طبیعی'], options: [{ label: 'رنگ', values: ['قهوه‌ای', 'مشکی'] }] },
      { slug: 'philips-blender', name: 'مخلوط‌کن فیلیپس', price: 2400000, discount: 22, soldCount: 428, category: 'home', ribbon: '', ribbonColor: '', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/104368557-82ff-4fe5-98e6-69bc995f97e4.png', desc: 'مخلوط‌کن فیلیپس با قدرت ۱۰۰۰ وات', specs: ['قدرت: ۱۰۰۰ وات'], options: [{ label: 'رنگ', values: ['مشکی', 'سفید'] }] },
      { slug: 'dior-perfume', name: 'عطر مردانه Dior', price: 3800000, discount: 12, soldCount: 987, category: 'beauty', ribbon: 'تخفیف استثنایی', ribbonColor: 'green', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/1a7f722d1-322d-4f60-a3c6-974e7c92dde7.png', desc: 'عطر مردانه Dior با رایحه چوبی', specs: ['حجم: ۱۰۰ میلی‌لیتر'], options: [{ label: 'حجم', values: ['۵۰ میلی‌لیتر', '۱۰۰ میلی‌لیتر'] }] },
      { slug: 'mountain-bike', name: 'دوچرخه کوهستان', price: 12500000, discount: 8, soldCount: 156, category: 'sports', ribbon: 'جدید', ribbonColor: 'gold', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/1ff23f93d-e4cf-43fd-be53-2bc753de0522.png', desc: 'دوچرخه کوهستان با فریم آلومینیومی', specs: ['فریم: آلومینیوم', 'دنده: ۲۱ سرعته'], options: [{ label: 'سایز', values: ['M', 'L', 'XL'] }] },
    ];

    for (const p of products) {
      await prisma.product.create({
        data: {
          slug: p.slug, name: p.name, description: p.desc,
          price: p.price, discount: p.discount, soldCount: p.soldCount,
          stock: 100, ribbon: p.ribbon || null, ribbonColor: p.ribbonColor || null,
          specs: JSON.stringify(p.specs), options: JSON.stringify(p.options),
          categoryId: catMap[p.category],
          images: { create: [{ url: p.image }] }
        }
      });
    }

    // کاربران
    const adminHash = await bcrypt.hash('Admin@1234', 10);
    const userHash = await bcrypt.hash('User@1234', 10);
    await prisma.user.create({ data: { firstName: 'مدیر', lastName: 'سیستم', email: 'admin@megamarket.ir', phone: '09120000000', passwordHash: adminHash, role: 'ADMIN' } });
    await prisma.user.create({ data: { firstName: 'سارا', lastName: 'محمدی', email: 'sara@example.com', phone: '09121234567', passwordHash: userHash, role: 'USER' } });

    return NextResponse.json({ success: true, message: 'دیتابیس با موفقیت پر شد!' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}