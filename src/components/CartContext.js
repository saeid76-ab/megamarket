'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'megamarket_cart_v1';

function loadCart() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// هر آیتم سبد: { productId, name, image, unitPrice, quantity, selectedOptions, stock }
function sameOptions(a, b) {
  return JSON.stringify(a || {}) === JSON.stringify(b || {});
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCart(items);
  }, [items, hydrated]);

  const addItem = useCallback((product, quantity = 1, selectedOptions = {}) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (it) => it.productId === product.id && sameOptions(it.selectedOptions, selectedOptions)
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
        return updated;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          image: product.image,
          unitPrice: product.finalPrice,
          quantity,
          selectedOptions,
          stock: product.stock
        }
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId, selectedOptions) => {
    setItems((prev) =>
      prev.filter((it) => !(it.productId === productId && sameOptions(it.selectedOptions, selectedOptions)))
    );
  }, []);

  const updateQuantity = useCallback((productId, selectedOptions, quantity) => {
    setItems((prev) =>
      prev.map((it) =>
        it.productId === productId && sameOptions(it.selectedOptions, selectedOptions)
          ? { ...it, quantity: Math.max(1, quantity) }
          : it
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = items.reduce((sum, it) => sum + it.quantity, 0);
  const totalAmount = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        totalAmount,
        isOpen,
        setIsOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart باید داخل CartProvider استفاده شود');
  return ctx;
}
