'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';

const filters = [
  { key: 'all', label: 'همه' },
  { key: 'electronics', label: 'الکترونیک' },
  { key: 'fashion', label: 'پوشاک' },
  { key: 'home', label: 'لوازم خانگی' },
  { key: 'beauty', label: 'زیبایی' },
  { key: 'sports', label: 'ورزشی' }
];

export default function ProductsFilterGrid({ initialProducts }) {
  const [active, setActive] = useState('all');

  const filtered =
    active === 'all' ? initialProducts : initialProducts.filter((p) => p.category?.slug === active);

  return (
    <>
      <div className="filters">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`filter-btn ${active === f.key ? 'active' : ''}`}
            onClick={() => setActive(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="products-grid">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}
