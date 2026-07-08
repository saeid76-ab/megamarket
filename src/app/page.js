import HeroSlider from '@/components/HeroSlider';
import ProductCard from '@/components/ProductCard';
import ProductsFilterGrid from '@/components/ProductsFilterGrid';
import { getAllProducts, getTopDiscountProducts, getLatestProducts } from '@/lib/products';

export default async function HomePage() {
  const [allProducts, topDiscounts, latest] = await Promise.all([
    getAllProducts(),
    getTopDiscountProducts(10),
    getLatestProducts(10)
  ]);

  return (
    <div id="mainSite">
      <HeroSlider />

      <section className="section" id="topDiscounts">
        <div className="container">
          <div className="section-title">
            <span>🔥 بیشترین تخفیف‌ها</span>
            <h2>کالاهای با تخفیف ویژه</h2>
            <p>فرصت را از دست ندهید!</p>
          </div>
          <div className="products-grid">
            {topDiscounts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="latestProducts">
        <div className="container">
          <div className="section-title">
            <span>✨ جدیدترین‌ها</span>
            <h2>آخرین کالاهای اضافه شده</h2>
            <p>تازه‌ترین محصولات فروشگاه</p>
          </div>
          <div className="products-grid">
            {latest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="products">
        <div className="container">
          <div className="section-title">
            <span>همه محصولات</span>
            <h2>فروشگاه مگامارکت</h2>
            <p>مجموعه کامل کالاهای ما</p>
          </div>
          <ProductsFilterGrid initialProducts={allProducts} />
        </div>
      </section>

      <section className="section section-alt" id="about">
        <div className="container">
          <div className="about-stats">
            <div className="stat-box"><div className="num">۱۰+</div><div className="lbl">سال تجربه</div></div>
            <div className="stat-box"><div className="num">۵K+</div><div className="lbl">مشتری راضی</div></div>
            <div className="stat-box"><div className="num">۱۰K+</div><div className="lbl">محصول متنوع</div></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <span>نظرات مشتریان</span>
            <h2>مشتریان ما چه می‌گویند</h2>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">خرید از مگامارکت خیلی راحت بود. کالایی که سفارش دادم دقیقاً مطابق توضیحات بود و سریع هم ارسال شد.</p>
              <div className="testimonial-author">
                <div className="author-avatar">س</div>
                <div className="author-info"><h5>سارا محمدی</h5><p>تهران</p></div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">قیمت‌ها واقعاً مناسب بود و کیفیت کالاها عالی. پشتیبانی هم خیلی سریع و حرفه‌ای پاسخ داد.</p>
              <div className="testimonial-author">
                <div className="author-avatar">م</div>
                <div className="author-info"><h5>محمد رضایی</h5><p>اصفهان</p></div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">تنوع محصولات فوق‌العاده است. هر چیزی که نیاز داشتم رو از اینجا خریدم. حتماً دوباره خرید می‌کنم.</p>
              <div className="testimonial-author">
                <div className="author-avatar">ع</div>
                <div className="author-info"><h5>علی کریمی</h5><p>شیراز</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
