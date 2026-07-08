import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductDetailInteractive from '@/components/ProductDetailInteractive';
import ProductCard from '@/components/ProductCard';
import { getProductBySlug, getRelatedProducts } from '@/lib/products';

export async function generateMetadata({ params }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'محصول یافت نشد | مگامارکت' };
  return {
    title: `${product.name} | مگامارکت`,
    description: product.description
  };
}

export default async function ProductDetailPage({ params }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);

  return (
    <section className="product-detail-page active">
      <div className="container">
        <Link href="/products" className="back-btn">→ بازگشت به فروشگاه</Link>

        <div className="breadcrumb">
          <Link href="/">صفحه اصلی</Link>
          <span className="sep">/</span>
          <Link href="/products">محصولات</Link>
          <span className="sep">/</span>
          <span>{product.category?.label}</span>
          <span className="sep">/</span>
          <span>{product.name}</span>
        </div>

        <ProductDetailInteractive product={product} />

        <div className="related-section">
          <h3 className="related-title">محصولات مرتبط</h3>
          <div className="related-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
