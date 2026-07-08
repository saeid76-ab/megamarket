'use client';

import Link from 'next/link';
import { formatPrice, formatNumber, finalPrice } from '@/lib/format';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const fp = finalPrice(product.price, product.discount);
  const image = product.images?.[0]?.url || product.image;

  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      showToast('این محصول در حال حاضر ناموجود است', 'error');
      return;
    }
    addItem({ id: product.id, name: product.name, image, finalPrice: fp, stock: product.stock }, 1, {});
    showToast(`"${product.name}" به سبد خرید اضافه شد`, 'success');
  }

  return (
    <Link href={`/products/${product.slug}`} className="product-card">
      <div className="product-image">
        {product.ribbon && (
          <div
            className={`product-ribbon ${!product.ribbonColor?.startsWith('#') ? (product.ribbonColor || '') : ''}`}
            style={product.ribbonColor?.startsWith('#') ? { background: product.ribbonColor } : {}}
          >
            {product.ribbon}
          </div>
        )}
        <img src={image} alt={product.name} />
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <div className="product-rating">⭐⭐⭐⭐⭐</div>
        <div className="product-sold">
          🛍 <span>فروش:</span> <strong>{formatNumber(product.soldCount)}</strong> <span>عدد</span>
        </div>
        <div className="product-price-old">{formatPrice(product.price)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
          <div className="product-price">{formatPrice(fp)}</div>
          {product.discount > 0 && <span className="product-discount-badge">{product.discount}٪</span>}
        </div>
        <div className="product-footer">
          <span style={{ fontSize: 12, color: 'var(--text-light)' }}>{product.category?.label}</span>
          <button className="add-cart-btn" onClick={handleAddToCart} disabled={product.stock <= 0}>
            {product.stock <= 0 ? 'ناموجود' : 'افزودن به سبد'}
          </button>
        </div>
      </div>
    </Link>
  );
}
