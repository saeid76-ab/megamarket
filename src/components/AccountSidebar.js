'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/account', label: '👤 پروفایل من' },
  { href: '/account/orders', label: '📦 سفارش‌های من' },
  { href: '/account/addresses', label: '📍 آدرس‌های من' },
  { href: '/account/security', label: '🔒 امنیت حساب' }
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <div className="account-sidebar">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={pathname === l.href ? 'active' : ''}>
          {l.label}
        </Link>
      ))}
    </div>
  );
}
