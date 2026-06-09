'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSalesData, updateStatus, SalesRow } from '@/lib/api';
import { STATUS_COLOR, STATUS_OPTIONS } from '@/lib/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 15;

export default function DataPage() {
  const router = useRouter();
  const [data, setData] = useState<SalesRow[]>([]);
  const [filtered, setFiltered] = useState<SalesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>('all');
  const [page, setPage] = useState(1);
  const [editRow, setEditRow] = useState<SalesRow | null>(null);
  const [newStatus, setNewStatus] = useState<string | null>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('auth') !== 'ok') router.replace('/login');
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchSalesData();
      setData(rows);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let f = data;
    if (filterStatus && filterStatus !== 'all') f = f.filter(d => d.statusAnalisis === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      f = f.filter(d =>
        d.namaDebitur?.toLowerCase().includes(q) ||
        d.namaRefferal?.toLowerCase().includes(q) ||
        d.namaAnalisis?.toLowerCase().includes(q) ||
        d.produk?.toLowerCase().includes(q)
      );
    }
    setFiltered(f);
    setPage(1);
  }, [data, search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleSaveStatus() {
    if (!editRow || !newStatus) return;
    setSaving(true);
    try {
    await updateStatus(editRow.rowIndex, newStatus ?? '');
      setData(prev => prev.map(r =>
        r.rowIndex === editRow.rowIndex ? { ...r, statusAnalisis: newStatus } : r
      ));
      setEditRow(null);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  function formatRupiah(val: string) {
    const n = parseFloat(val?.replace(/[^0-9.]/g, ''));
    if (isNaN(n)) return val || '-';
    return `Rp ${n.toLocaleString('id-ID')}`;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#0D1117]">Data Pengajuan</h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">{filtered.length} entri ditemukan</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[#E2E5EA] bg-white text-[#6B7280] hover:border-[#006885] hover:text-[#006885] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari debitur, referral, analis..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded border border-[#E2E5EA] bg-white focus:outline-none focus:ring-2 focus:ring-[#006885]/20 focus:border-[#006885] transition-colors"
          />
        </div>
        <Select value={filterStatus ?? 'all'} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 text-xs h-9 border-[#E2E5EA]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border border-[#E2E5EA] shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#E2E5EA] bg-[#F7F8FA]">
                {['No', 'Tgl Kunjungan', 'Debitur', 'Produk', 'Referral', 'Analis', 'Potensi', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-[#6B7280] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#F3F4F6]">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[#9CA3AF]">Tidak ada data</td>
                </tr>
              ) : (
                paginated.map((row, i) => (
                  <tr key={row.rowIndex} className="border-b border-[#F3F4F6] hover:bg-[#F7F8FA] transition-colors">
                    <td className="px-4 py-3 text-[#9CA3AF]">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.tanggalKunjungan || '-'}</td>
                    <td className="px-4 py-3 font-medium text-[#0D1117] whitespace-nowrap">{row.namaDebitur || '-'}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{row.produk || '-'}</td>
                    <td className="px-4 py-3">{row.namaRefferal || '-'}</td>
                    <td className="px-4 py-3">{row.namaAnalisis || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[#006885]">{formatRupiah(row.potensipembiayaan)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                        STATUS_COLOR[row.statusAnalisis] || 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {row.statusAnalisis || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setEditRow(row); setNewStatus(row.statusAnalisis); }}
                        className="text-[10px] px-2.5 py-1 rounded border border-[#E2E5EA] text-[#006885] hover:bg-[#E8F4F8] transition-colors font-medium"
                      >
                        Ubah Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E5EA] bg-white">
          <p className="text-xs text-[#9CA3AF]">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded border border-[#E2E5EA] text-[#6B7280] hover:border-[#006885] hover:text-[#006885] disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded border border-[#E2E5EA] text-[#6B7280] hover:border-[#006885] hover:text-[#006885] disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </Card>

      {/* Edit status dialog */}
      <Dialog open={!!editRow} onOpenChange={open => !open && setEditRow(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Ubah Status Analisis</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div>
              <p className="text-xs text-[#6B7280] mb-0.5">Debitur</p>
              <p className="text-sm font-medium">{editRow?.namaDebitur}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280] mb-1.5">Status Baru</p>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v ?? '')}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditRow(null)} className="text-xs">Batal</Button>
            <Button
              size="sm"
              onClick={handleSaveStatus}
              disabled={saving}
              className="text-xs bg-[#006885] hover:bg-[#005570]"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
