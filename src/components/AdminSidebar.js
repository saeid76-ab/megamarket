'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin', label: '📊 داشبورد' },
  { href: '/admin/products', label: '📦 محصولات' },
  { href: '/admin/orders', label: '🧾 سفارش‌ها' },
  { href: '/admin/reviews', label: '💬 نظرات کاربران' }
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="admin-sidebar">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={pathname === l.href ? 'active' : ''}>
          {l.label}
        </Link>
      ))}
      <Link href="/">↩ بازگشت به فروشگاه</Link>
    </div>
  );
}
