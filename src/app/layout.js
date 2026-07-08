import './globals.css';
import { CartProvider } from '@/components/CartContext';
import { UserProvider } from '@/components/UserContext';
import { ToastProvider } from '@/components/ToastContext';
import { getCurrentUser } from '@/lib/auth';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import CartModal from '@/components/CartModal';

export const metadata = {
  title: 'مگامارکت | فروشگاه آنلاین',
  description:
    'فروشگاه آنلاین مگامارکت - خرید آنلاین انواع کالای الکترونیک، پوشاک، لوازم خانگی، زیبایی و ورزشی با ارسال رایگان و ضمانت اصالت.',
  openGraph: {
    title: 'مگامارکت | فروشگاه آنلاین',
    description: 'خریدی آسان و مطمئن از هزاران کالای متنوع با ارسال رایگان.',
    locale: 'fa_IR',
    type: 'website'
  }
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
      </head>
      <body>
        <UserProvider initialUser={user}>
          <ToastProvider>
            <CartProvider>
              <SiteHeader />
              {children}
              <SiteFooter />
              <CartModal />
            </CartProvider>
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
