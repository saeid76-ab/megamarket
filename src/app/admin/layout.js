import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';

export const metadata = { title: 'پنل مدیریت | مگامارکت' };

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }
  if (user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">{children}</div>
    </div>
  );
}
