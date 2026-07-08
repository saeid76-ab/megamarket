'use client';

import { useRouter } from 'next/navigation';
import { useCart } from './CartContext';
import { useUser } from './UserContext';
import { useToast } from './ToastContext';
import { formatPrice } from '@/lib/format';

function optionsLabel(opts) {
  if (!opts || Object.keys(opts).length === 0) return null;
  return Object.entries(opts).map(([k, v]) => `${k}: ${v}`).join(' | ');
}

export default function CartModal() {
  const { items, removeItem, updateQuantity, totalAmount, isOpen, setIsOpen } = useCart();
  const { user } = useUser();
  const { showToast } = useToast();
  const router = useRouter();

  if (!isOpen) return null;

  function handleCheckout() {
    if (!user) {
      setIsOpen(false);
      showToast('برای تکمیل خرید ابتدا وارد حساب کاربری شوید', 'error');
      router.push('/login?redirect=/checkout');
      return;
    }
    setIsOpen(false);
    router.push('/checkout');
  }

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && setIsOpen(false)}>
      <div className="modal">
        <div className="modal-header">
          <h3>سبد خرید</h3>
          <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">سبد خرید شما خالی است</div>
        ) : (
          <>
            <div>
              {items.map((it, idx) => (
                <div className="cart-item" key={idx}>
                  <img src={it.image} alt={it.name} />
                  <div className="cart-item-info">
                    <h5>{it.name}</h5>
                    {optionsLabel(it.selectedOptions) && (
                      <div className="opts">{optionsLabel(it.selectedOptions)}</div>
                    )}
                    <div className="price">{formatPrice(it.unitPrice)}</div>
                    <div className="cart-item-qty">
                      <button
                        className="qty-btn"
                        style={{ width: 26, height: 26 }}
                        onClick={() => updateQuantity(it.productId, it.selectedOptions, it.quantity - 1)}
                      >
                        −
                      </button>
                      <span>{it.quantity.toLocaleString('fa-IR')}</span>
                      <button
                        className="qty-btn"
                        style={{ width: 26, height: 26 }}
                        onClick={() => updateQuantity(it.productId, it.selectedOptions, it.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button className="remove-btn" onClick={() => removeItem(it.productId, it.selectedOptions)}>🗑</button>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <div className="cart-total-row">
                <span>جمع کل:</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <button className="checkout-btn" onClick={handleCheckout}>تکمیل خرید</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
