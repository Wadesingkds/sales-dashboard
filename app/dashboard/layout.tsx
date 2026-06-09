'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSalesData, updateStatus, SalesRow } from '@/lib/api';
import { STATUS_COLOR, STATUS_OPTIONS } from '@/lib/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import {
  Users, TrendingUp, CheckCircle2, Clock, XCircle,
  RefreshCw, LogOut, LayoutDashboard, TableIcon,
} from 'lucide-react';

const TEAL = '#006885';
const ORANGE = '#F15A22';
const GREEN = '#10B981';
const RED = '#EF4444';
const AMBER = '#F59E0B';

function formatRupiah(val: string | number) {
  const n = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.]/g, '')) : val;
  if (isNaN(n)) return '-';
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} Jt`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

function parsePotensi(val: string): number {
  if (!val) return 0;
  const clean = val.replace(/[^0-9.]/g, '');
  return parseFloat(clean) || 0;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  function logout() {
    sessionStorage.removeItem('auth');
    router.replace('/login');
  }
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-[#E2E5EA] flex items-center px-6 gap-4">
        <div className="h-0.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#006885] to-[#F15A22]" />
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#006885] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="white" />
            </svg>
          </div>
          <span className="font-semibold text-sm text-[#0D1117] tracking-tight">Sales Monitor</span>
        </div>
        <div className="flex items-center gap-1 ml-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-[#6B7280] hover:text-[#006885] hover:bg-[#E8F4F8] transition-colors"
          >
            <LayoutDashboard size={13} /> Overview
          </button>
          <button
            onClick={() => router.push('/dashboard/data')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-[#6B7280] hover:text-[#006885] hover:bg-[#E8F4F8] transition-colors"
          >
            <TableIcon size={13} /> Data
          </button>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-[#9CA3AF]">admin</span>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-red-500 transition-colors">
            <LogOut size={13} /> Keluar
          </button>
        </div>
      </header>
      <main className="pt-14">{children}</main>
    </div>
  );
}
