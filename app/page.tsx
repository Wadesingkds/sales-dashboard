'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    if (auth === 'ok') router.replace('/dashboard');
    else router.replace('/login');
  }, [router]);
  return null;
}
