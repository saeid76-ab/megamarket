'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from './UserContext';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import AuthModal from './AuthModal';

export default function SiteHeader() {
  const { user, logout } = useUser();
  const { totalCount, setIsOpen } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const [navOpen, setNavOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  function handleLoginBtnClick() {
    if (user) {
      setDropdownOpen((v) => !v);
    } else {
      setAuthTab('login');
      setAuthOpen(true);
    }
  }

  async function handleLogout() {
    await logout();
    setDropdownOpen(false);
    showToast('با موفقیت از حساب خود خارج شدید', 'success');
    router.push('/');
  }

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-info">
            <span>📞 ۰۲۱-۸۸۷۶۶۵۵</span>
            <span>✉️ info@megamarket.ir</span>
          </div>
          <div>ارسال رایگان برای خرید بالای ۵۰۰ هزار تومان</div>
        </div>
      </div>

      <header className="header">
        <div className="container header-inner">
          <Link href="/" className="logo">
            <div className="logo-icon">MM</div>
            <div className="logo-text">
              <h1>مگامارکت</h1>
              <p>Mega Market</p>
            </div>
          </Link>

          <nav className={`nav ${navOpen ? 'active' : ''}`} id="mainNav">
            <Link href="/" onClick={() => setNavOpen(false)}>صفحه اصلی</Link>
            <Link href="/products" onClick={() => setNavOpen(false)}>محصولات</Link>
            <Link href="/#about" onClick={() => setNavOpen(false)}>درباره ما</Link>
          </nav>

          <div className="header-actions">
            <button className={`login-btn ${user ? 'logged-in' : ''}`} onClick={handleLoginBtnClick}>
              <span>👤</span>
              <span className="btn-text">{user ? `${user.firstName} ${user.lastName}` : 'ورود / ثبت‌نام'}</span>
            </button>

            {user && (
              <div className="user-menu" ref={menuRef}>
                <div className={`user-dropdown ${dropdownOpen ? 'active' : ''}`}>
                  <div className="user-dropdown-header">
                    <div className="name">{user.firstName} {user.lastName}</div>
                    <div className="email">{user.email}</div>
                  </div>
                  <Link href="/account" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    👤 پروفایل من
                  </Link>
                  <Link href="/account/orders" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    📦 سفارش‌های من
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="user-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      🛠 پنل مدیریت
                    </Link>
                  )}
                  <button className="user-dropdown-item danger" onClick={handleLogout}>
                    🚪 خروج از حساب
                  </button>
                </div>
              </div>
            )}

            <button className="cart-btn" onClick={() => setIsOpen(true)}>
              🛒 سبد خرید <span className="cart-count">{totalCount}</span>
            </button>
            <button className="menu-toggle" onClick={() => setNavOpen((v) => !v)}>☰</button>
          </div>
        </div>
      </header>

      <AuthModal
        open={authOpen}
        initialTab={authTab}
        onClose={() => setAuthOpen(false)}
      />

      {/* لینک ثبت‌نام برای صفحه اختصاصی */}
      <style>{`
        .auth-footer a[href="/register"] { display: inline; }
      `}</style>
    </>
  );
}
