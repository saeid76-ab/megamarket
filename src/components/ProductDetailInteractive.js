'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartContext';
import { useToast } from '@/components/ToastContext';
import { formatPrice, formatNumber } from '@/lib/format';
import ProductReviews from '@/components/ProductReviews';

export default function ProductDetailInteractive({ product }) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [activeImage, setActiveImage] = useState(product.image);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('desc');
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const init = {};
    (product.options || []).forEach((o) => {
      init[o.label] = o.values[0];
    });
    return init;
  });

  const thumbs = [product.image, product.image, product.image, product.image];

  function changeQty(delta) {
    setQty((q) => Math.max(1, q + delta));
  }

  function handleAddToCart() {
    if (product.stock <= 0) {
      showToast('این محصول در حال حاضر ناموجود است', 'error');
      return;
    }
    addItem(
      { id: product.id, name: product.name, image: product.image, finalPrice: product.finalPrice, stock: product.stock },
      qty,
      selectedOptions
    );
    showToast(`"${product.name}" به سبد خرید اضافه شد`, 'success');
  }

  return (
    <>
      <div className="pd-grid">
        {product.ribbon && (
          <div className={`pd-ribbon ${product.ribbonColor || ''}`}>{product.ribbon}</div>
        )}

        <div className="pd-gallery">
          <div className="pd-main-image">
            <img src={activeImage} alt={product.name} />
          </div>
          <div className="pd-thumbs">
            {thumbs.map((src, i) => (
              <div
                key={i}
                className={`pd-thumb ${activeImage === src && i === 0 ? 'active' : ''}`}
                onClick={() => setActiveImage(src)}
              >
                <img src={src} alt={`تصویر ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="pd-info">
          <div className="pd-badges">
            {product.ribbon && <span className="pd-badge">{product.ribbon}</span>}
            {product.stock > 0 ? (
              <span className="pd-badge success">✓ موجود در انبار</span>
            ) : (
              <span className="pd-badge danger">ناموجود</span>
            )}
            <span className="pd-badge outline">ارسال رایگان</span>
          </div>

          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-rating">
            <span>⭐⭐⭐⭐⭐</span>
            <span>(۱۲۸ نظر)</span>
          </div>

          <div className="pd-sold">
            <span>🛍</span>
            <span>تعداد فروش:</span>
            <strong>{formatNumber(product.soldCount)}</strong>
            <span>عدد</span>
          </div>

          <div className="pd-price-box">
            <div>
              <div className="pd-price-old">{formatPrice(product.price)}</div>
              <div className="pd-price">{formatPrice(product.finalPrice)}</div>
            </div>
            {product.discount > 0 && <span className="pd-discount">{product.discount}٪ تخفیف</span>}
          </div>

          <p className="pd-short-desc">{product.description}</p>

          {(product.options || []).map((opt) => (
            <div className="pd-options" key={opt.label}>
              <div className="pd-option-label">{opt.label}:</div>
              <div className="pd-option-group">
                {opt.values.map((v) => (
                  <button
                    key={v}
                    className={`pd-option ${selectedOptions[opt.label] === v ? 'selected' : ''}`}
                    onClick={() => setSelectedOptions((s) => ({ ...s, [opt.label]: v }))}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="pd-quantity">
            <div className="pd-option-label" style={{ margin: 0 }}>تعداد:</div>
            <div className="qty-box">
              <button className="qty-btn" onClick={() => changeQty(-1)}>−</button>
              <div className="qty-value">{qty.toLocaleString('fa-IR')}</div>
              <button className="qty-btn" onClick={() => changeQty(1)}>+</button>
            </div>
          </div>

          <div className="pd-actions">
            <button className="pd-add-cart" onClick={handleAddToCart} disabled={product.stock <= 0}>
              🛒 {product.stock <= 0 ? 'ناموجود' : 'افزودن به سبد خرید'}
            </button>
            <button className="pd-fav">♡ علاقه‌مندی</button>
          </div>

          <div className="pd-meta">
            <div className="pd-meta-item"><strong>کد محصول:</strong><span>MM-{String(product.id).slice(0, 8).toUpperCase()}</span></div>
            <div className="pd-meta-item"><strong>دسته‌بندی:</strong><span>{product.category?.label}</span></div>
            <div className="pd-meta-item"><strong>گارانتی:</strong><span>ضمانت اصالت و بازگشت ۷ روزه</span></div>
            <div className="pd-meta-item"><strong>ارسال:</strong><span>ارسال رایگان به سراسر ایران</span></div>
          </div>
        </div>
      </div>

      <div className="pd-tabs">
        <div className="pd-tab-headers">
          <button className={`pd-tab-header ${activeTab === 'desc' ? 'active' : ''}`} onClick={() => setActiveTab('desc')}>توضیحات محصول</button>
          <button className={`pd-tab-header ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')}>مشخصات فنی</button>
          <button className={`pd-tab-header ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>نظرات کاربران</button>
        </div>

        <div className={`pd-tab-content ${activeTab === 'desc' ? 'active' : ''}`}>
          <p>{product.description}</p>
          <br />
          <p>این محصول با کیفیت بالا و ضمانت اصالت عرضه می‌شود.</p>
        </div>

        <div className={`pd-tab-content ${activeTab === 'specs' ? 'active' : ''}`}>
          <ul>
            {(product.specs || []).map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>

        <div className={`pd-tab-content ${activeTab === 'reviews' ? 'active' : ''}`}>
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </>
  );
}
