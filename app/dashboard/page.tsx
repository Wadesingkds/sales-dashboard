'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSalesData, SalesRow } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { Users, TrendingUp, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';

const TEAL = '#006885';
const ORANGE = '#F15A22';
const GREEN = '#10B981';
const RED = '#EF4444';
const AMBER = '#F59E0B';

function formatRupiah(val: string | number) {
  const n = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.,]/g, '').replace(',', '.')) : val;
  if (isNaN(n)) return '-';
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)} Jt`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

function parsePotensi(val: string): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<SalesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (sessionStorage.getItem('auth') !== 'ok') router.replace('/login');
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchSalesData();
      setData(rows);
      setLastRefresh(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  // --- derived metrics ---
  const total = data.length;
  const selesai = data.filter(d => d.statusAnalisis === 'Selesai').length;
  const proses = data.filter(d => d.statusAnalisis === 'Proses').length;
  const ditolak = data.filter(d => d.statusAnalisis === 'Ditolak').length;
  const totalPotensi = data.reduce((s, d) => s + parsePotensi(d.potensipembiayaan), 0);

  // Status pie
  const pieData = [
    { name: 'Proses', value: proses, color: AMBER },
    { name: 'Selesai', value: selesai, color: GREEN },
    { name: 'Ditolak', value: ditolak, color: RED },
  ].filter(d => d.value > 0);

  // Top 5 referral bar
  const refCount: Record<string, number> = {};
  data.forEach(d => {
    const k = d.namaRefferal || 'Tidak diketahui';
    refCount[k] = (refCount[k] || 0) + 1;
  });
  const topReferral = Object.entries(refCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name: name.length > 12 ? name.slice(0, 12) + '…' : name, value }));

  // Daily trend (last 14 days)
  const trendMap: Record<string, { total: number; selesai: number }> = {};
  data.forEach(d => {
    const date = d.tanggalKunjungan?.slice(0, 10) || d.timestamp?.slice(0, 10) || '';
    if (!date) return;
    if (!trendMap[date]) trendMap[date] = { total: 0, selesai: 0 };
    trendMap[date].total++;
    if (d.statusAnalisis === 'Selesai') trendMap[date].selesai++;
  });
  const trendData = Object.entries(trendMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([date, v]) => ({ date: date.slice(5), ...v }));

  // Top analisis
  const analisisCount: Record<string, number> = {};
  data.forEach(d => {
    const k = d.namaAnalisis || '-';
    analisisCount[k] = (analisisCount[k] || 0) + 1;
  });
  const topAnalisis = Object.entries(analisisCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name: name.length > 14 ? name.slice(0, 14) + '…' : name, value }));

  const kpis = [
    { label: 'Total Pengajuan', value: total, icon: Users, color: TEAL, bg: '#E8F4F8' },
    { label: 'Selesai', value: selesai, icon: CheckCircle2, color: GREEN, bg: '#D1FAE5' },
    { label: 'Sedang Diproses', value: proses, icon: Clock, color: AMBER, bg: '#FEF3C7' },
    { label: 'Ditolak', value: ditolak, icon: XCircle, color: RED, bg: '#FEE2E2' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#0D1117]">Overview</h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Terakhir diperbarui: {lastRefresh.toLocaleTimeString('id-ID')}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[#E2E5EA] bg-white text-[#6B7280] hover:border-[#006885] hover:text-[#006885] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="border border-[#E2E5EA] shadow-none">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">{k.label}</p>
                  {loading
                    ? <Skeleton className="h-8 w-16" />
                    : <p className="text-3xl font-bold tracking-tight" style={{ color: k.color }}>{k.value}</p>
                  }
                </div>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: k.bg }}>
                  <k.icon size={18} style={{ color: k.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Potensi total */}
      <Card className="border border-[#E2E5EA] shadow-none bg-[#006885] text-white">
        <CardContent className="px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60 uppercase tracking-widest mb-0.5">Total Potensi Pembiayaan</p>
            {loading
              ? <Skeleton className="h-8 w-40 bg-white/20" />
              : <p className="text-3xl font-bold tracking-tight">{formatRupiah(totalPotensi)}</p>
            }
          </div>
          <TrendingUp size={36} className="text-white/20" />
        </CardContent>
      </Card>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend line */}
        <Card className="lg:col-span-2 border border-[#E2E5EA] shadow-none">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-medium text-[#374151]">Tren Pengajuan (14 Hari Terakhir)</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            {loading ? <Skeleton className="h-48 w-full" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, border: '1px solid #E2E5EA', borderRadius: 6, boxShadow: 'none' }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="total" stroke={TEAL} strokeWidth={2} dot={false} name="Total" />
                  <Line type="monotone" dataKey="selesai" stroke={GREEN} strokeWidth={2} dot={false} name="Selesai" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status pie */}
        <Card className="border border-[#E2E5EA] shadow-none">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-medium text-[#374151]">Distribusi Status</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 flex flex-col items-center">
            {loading ? <Skeleton className="h-48 w-full" /> : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E2E5EA', borderRadius: 6 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      {d.name} ({d.value})
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top referral */}
        <Card className="border border-[#E2E5EA] shadow-none">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-medium text-[#374151]">Top 5 Referral</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            {loading ? <Skeleton className="h-40 w-full" /> : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topReferral} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E2E5EA', borderRadius: 6 }} />
                  <Bar dataKey="value" fill={TEAL} radius={[0, 4, 4, 0]} name="Pengajuan" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top analisis */}
        <Card className="border border-[#E2E5EA] shadow-none">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-medium text-[#374151]">Top 5 Analis</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            {loading ? <Skeleton className="h-40 w-full" /> : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topAnalisis} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E2E5EA', borderRadius: 6 }} />
                  <Bar dataKey="value" fill={ORANGE} radius={[0, 4, 4, 0]} name="Ditangani" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
