import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import AccountSidebar from '@/components/AccountSidebar';
import ProfileForm from '@/components/ProfileForm';

export const metadata = { title: 'پروفایل من | مگامارکت' };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/account');

  const orderCount = await prisma.order.count({ where: { userId: user.id } });
  const paidOrderCount = await prisma.order.count({ where: { userId: user.id, status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } } });
  const favoriteCount = await prisma.favorite.count({ where: { userId: user.id } });

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>حساب کاربری من</h1>
          <p>خوش آمدید، {user.firstName} {user.lastName}</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 60 }}>
        <div className="account-layout">
          <AccountSidebar />

          <div>
            <div className="account-summary">
              <div className="account-summary-box">
                <div className="num">{orderCount.toLocaleString('fa-IR')}</div>
                <div className="lbl">کل سفارش‌ها</div>
              </div>
              <div className="account-summary-box">
                <div className="num">{paidOrderCount.toLocaleString('fa-IR')}</div>
                <div className="lbl">سفارش‌های موفق</div>
              </div>
              <div className="account-summary-box">
                <div className="num">{favoriteCount.toLocaleString('fa-IR')}</div>
                <div className="lbl">علاقه‌مندی‌ها</div>
              </div>
            </div>

            <div className="account-card">
              <h3>اطلاعات شخصی</h3>
              <ProfileForm user={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
