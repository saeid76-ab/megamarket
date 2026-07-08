'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/components/UserContext';
import AuthModal from '@/components/AuthModal';

export default function LoginPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(true);

  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (user) {
      router.push(redirect);
    }
  }, [user, redirect, router]);

  function handleClose() {
    setOpen(false);
    router.push('/');
  }

  return (
    <div className="container" style={{ minHeight: '60vh' }}>
      <AuthModal
        open={open}
        initialTab="login"
        onClose={handleClose}
        onSuccess={() => router.push(redirect)}
      />
    </div>
  );
}
