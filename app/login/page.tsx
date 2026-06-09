'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '@Fefevan1512';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('auth', 'ok');
        router.replace('/dashboard');
      } else {
        setError('Username atau password salah.');
        setLoading(false);
      }
    }, 400);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
      {/* Brand strip */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006885] to-[#F15A22]" />

      <div className="w-full max-w-sm px-4">
        {/* Logo area */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-[#006885] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="white" />
              </svg>
            </div>
            <span className="text-xl font-semibold tracking-tight text-[#0D1117]">Sales Monitor</span>
          </div>
          <p className="text-sm text-[#6B7280]">Dashboard Kinerja & Analisis Pembiayaan</p>
        </div>

        <Card className="border border-[#E2E5EA] shadow-sm">
          <CardHeader className="pb-0 pt-6 px-6">
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-widest">AKSES SISTEM</p>
          </CardHeader>
          <CardContent className="px-6 pt-4 pb-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#374151]" htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-md border border-[#E2E5EA] bg-white focus:outline-none focus:ring-2 focus:ring-[#006885]/20 focus:border-[#006885] transition-colors"
                  placeholder="Masukkan username"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#374151]" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-md border border-[#E2E5EA] bg-white focus:outline-none focus:ring-2 focus:ring-[#006885]/20 focus:border-[#006885] transition-colors"
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#006885] hover:bg-[#005570] text-white text-sm font-medium h-10 rounded-md transition-colors"
              >
                {loading ? 'Memverifikasi...' : 'Masuk'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#9CA3AF] mt-6">
          Sistem internal · Akses terbatas
        </p>
      </div>
    </div>
  );
}
