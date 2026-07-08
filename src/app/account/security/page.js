import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AccountSidebar from '@/components/AccountSidebar';
import ChangePasswordForm from '@/components/ChangePasswordForm';

export const metadata = { title: 'امنیت حساب | مگامارکت' };

export default async function SecurityPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/account/security');

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>امنیت حساب کاربری</h1>
          <p>رمز عبور خود را به‌صورت دوره‌ای تغییر دهید</p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 60 }}>
        <div className="account-layout">
          <AccountSidebar />
          <div className="account-card">
            <h3>تغییر رمز عبور</h3>
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
