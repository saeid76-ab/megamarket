import ProductsFilterGrid from '@/components/ProductsFilterGrid';
import { getAllProducts } from '@/lib/products';

export const metadata = {
  title: 'همه محصولات | مگامارکت'
};

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>همه محصولات</h1>
          <p>مجموعه کامل کالاهای فروشگاه مگامارکت را مشاهده کنید</p>
        </div>
      </div>
      <div className="container" style={{ paddingBottom: 60 }}>
        <ProductsFilterGrid initialProducts={products} />
      </div>
    </div>
  );
}
