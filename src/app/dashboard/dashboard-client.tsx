'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import type { SalesData, SummaryStats } from '@/lib/sheets'

const ORANGE  = '#F15A22'
const SLATE   = '#494E5C'
const TEAL    = '#006885'
const TEAL_LT = '#E6F3F7'
const BORDER  = '#E5E7EB'
const BG      = '#F8F9FB'
const TEXT    = '#1A1C23'
const MUTED   = '#6B7280'
const PIE_COLORS = [ORANGE, TEAL, SLATE, '#F7A07A', '#4BA8C0']

function formatRupiah(n: number) {
  if (n >= 1_000_000_000) return 'Rp ' + (n / 1_000_000_000).toFixed(2) + ' M'
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(0) + ' jt'
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n)
}

function getStatusColor(status: string): { bg: string; text: string } {
  const s = status.toLowerCase()
  if (s.includes('approve') || s.includes('selesai') || s.includes('lunas'))
    return { bg: '#ECFDF5', text: '#065F46' }
  if (s.includes('proses') || s.includes('review') || s.includes('analisis'))
    return { bg: TEAL_LT, text: TEAL }
  if (s.includes('tolak') || s.includes('reject') || s.includes('batal'))
    return { bg: '#FEF2F2', text: '#991B1B' }
  return { bg: '#F3F4F6', text: SLATE }
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div
      style={{
        background: accent ? ORANGE : '#ffffff',
        border: `1px solid ${accent ? ORANGE : BORDER}`,
        borderRadius: 12,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        transition: 'box-shadow 0.2s',
      }}
      className='hover:shadow-md'
    >
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent ? 'rgba(255,255,255,0.75)' : MUTED }}>
        {label}
      </span>
      <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1, color: accent ? '#fff' : TEXT }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: 12, color: accent ? 'rgba(255,255,255,0.65)' : MUTED }}>
          {sub}
        </span>
      )}
    </div>
  )
}

export default function DashboardClient() {
  const router = useRouter()
  const [data, setData] = useState<SalesData[]>([])
  const [summary, setSummary] = useState<SummaryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterReferral, setFilterReferral] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    namaDebitur: '', bulan: '', pemberiReff: '', produk: '', analisis: '', potensiPembiayaan: '', status: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/sales')
      if (!res.ok) throw new Error('Gagal fetch data')
      const json = await res.json()
      setData(json.data)
      setSummary(json.summary)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error tidak diketahui')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/sales/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await res.json()

      if (result.success) {
        setShowAddForm(false)
        setFormData({ namaDebitur: '', bulan: '', pemberiReff: '', produk: '', analisis: '', potensiPembiayaan: '', status: '' })
        setTimeout(() => fetchData(), 2000)
      } else {
        setError(result.message || 'Gagal menambahkan data')
      }
    } catch (e) {
      setError('Terjadi kesalahan saat menambahkan data')
    } finally {
      setSubmitting(false)
    }
  }

  const referralOptions = summary ? Object.keys(summary.byReferral).filter(k => k !== '(Tidak Diketahui)') : []
  const statusOptions = summary ? Object.keys(summary.byStatus).filter(k => k !== '(Tidak Ada Status)') : []
  const filteredData = data.filter((row) => {
    if (filterReferral !== 'all' && row['Nama Referral']?.trim().toLowerCase() !== filterReferral.toLowerCase()) return false
    if (filterStatus !== 'all' && row['Status Analisis']?.trim() !== filterStatus) return false
    return row['Nama Debitur']?.trim() !== ''
  })
  const referralChartData = summary ? Object.entries(summary.byReferral).filter(([k]) => k !== '(Tidak Diketahui)').map(([name, value]) => ({ name, value })) : []
  const statusChartData = summary ? Object.entries(summary.byStatus).filter(([k]) => k !== '(Tidak Ada Status)').map(([name, value]) => ({ name, value })) : []

  return (
    <div style={{ minHeight: '100vh', background: BG, padding: '0 0 48px' }}>
      <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: '12px 16px', minHeight: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: '1 1 200px' }}>
          <div style={{ width: 4, height: 24, borderRadius: 2, background: ORANGE, flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Monitoring Pembiayaan</div>
            <div style={{ fontSize: 11, color: MUTED, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Data pipeline debitur · Google Sheets</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={fetchData} style={{ height: 32, padding: '0 14px', fontSize: 12, fontWeight: 600, borderRadius: 6, border: `1px solid ${BORDER}`, background: '#fff', color: SLATE, cursor: 'pointer', transition: 'all 0.15s' }}>Refresh</button>
          <button onClick={handleLogout} style={{ height: 32, padding: '0 14px', fontSize: 12, fontWeight: 600, borderRadius: 6, border: 'none', background: 'transparent', color: MUTED, cursor: 'pointer', transition: 'color 0.15s' }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 16px 0' }}>
        {loading && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>{[...Array(4)].map((_, i) => <div key={i} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, height: 100, padding: 24 }}><div style={{ height: 10, width: '50%', background: '#F3F4F6', borderRadius: 4, marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} /><div style={{ height: 28, width: '40%', background: '#F3F4F6', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} /></div>)}</div>}
        {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px', color: '#991B1B', fontSize: 13, marginBottom: 20 }}>{error}</div>}

        {!loading && summary && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
              <StatCard label="Total Debitur" value={summary.totalDebitur} accent />
              <StatCard label="Total Potensi" value={formatRupiah(summary.totalPotensi)} sub={`Rp ${new Intl.NumberFormat('id-ID').format(summary.totalPotensi)}`} />
              <StatCard label="Referral Aktif" value={referralOptions.length} />
              <StatCard label="Ditampilkan" value={filteredData.length} sub={`dari ${data.length} total`} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 16, marginBottom: 24 }}>
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Debitur per Referral</div>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 16 }}>Jumlah debitur per sumber referral</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200 }}>
                  {referralChartData.length === 0 ? (
                    <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>—</div>
                      <span style={{ fontSize: 12, color: MUTED }}>Belum ada data referral</span>
                    </div>
                  ) : (
                    referralChartData.sort((a, b) => (b.value as number) - (a.value as number)).map((item, idx) => {
                      const mockGrowth = idx === 0 ? 12 : idx === 1 ? -3 : idx === 2 ? 8 : 0
                      const hasGrowth = mockGrowth !== 0
                      const itemValue = item.value as number
                      const maxValue = Math.max(...referralChartData.map(d => d.value as number))
                      return (
                        <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: idx < referralChartData.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                          <div style={{ flex: '0 0 140px', fontSize: 13, fontWeight: 500, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                          <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 20, fontWeight: 700, color: ORANGE }}>{itemValue}</span>
                            {hasGrowth && <span style={{ fontSize: 11, fontWeight: 600, color: mockGrowth > 0 ? '#065F46' : '#991B1B', display: 'flex', alignItems: 'center', gap: 2 }}>{mockGrowth > 0 ? '↑' : '↓'} {Math.abs(mockGrowth)}%</span>}
                          </div>
                          <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: ORANGE, width: `${(itemValue / maxValue) * 100}%`, borderRadius: 3, transition: 'width 0.3s' }} />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 4 }}>Sebaran Status</div>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 16 }}>Distribusi status analisis debitur</div>
                {statusChartData.length === 0 ? (
                  <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>—</div>
                    <span style={{ fontSize: 12, color: MUTED }}>Belum ada data status</span>
                  </div>
                ) : (
                  <ResponsiveContainer width='100%' height={200}>
                    <PieChart>
                      <Pie data={statusChartData} dataKey='value' nameKey='name' cx='50%' cy='50%' innerRadius={55} outerRadius={80} paddingAngle={3}>
                        {statusChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12, color: TEXT, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Data Debitur</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button onClick={() => setShowAddForm(true)} style={{ height: 32, padding: '0 14px', fontSize: 12, fontWeight: 600, borderRadius: 6, border: 'none', background: ORANGE, color: '#fff', cursor: 'pointer', transition: 'opacity 0.15s' }}>+ Tambah Data</button>
                  <select value={filterReferral} onChange={e => setFilterReferral(e.target.value)} style={{ height: 32, padding: '0 10px', fontSize: 12, borderRadius: 6, border: `1px solid ${BORDER}`, background: '#fff', color: TEXT, cursor: 'pointer' }}>
                    <option value="all">Semua Referral</option>
                    {referralOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ height: 32, padding: '0 10px', fontSize: 12, borderRadius: 6, border: `1px solid ${BORDER}`, background: '#fff', color: TEXT, cursor: 'pointer' }}>
                    <option value="all">Semua Status</option>
                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <Table>
                  <TableHeader>
                    <TableRow style={{ background: '#F8F9FB' }}>
                      <TableHead style={{ fontWeight: 600, color: TEXT, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>No</TableHead>
                      <TableHead style={{ fontWeight: 600, color: TEXT, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Nama Debitur</TableHead>
                      <TableHead style={{ fontWeight: 600, color: TEXT, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Bulan</TableHead>
                      <TableHead style={{ fontWeight: 600, color: TEXT, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Referral</TableHead>
                      <TableHead style={{ fontWeight: 600, color: TEXT, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Produk</TableHead>
                      <TableHead style={{ fontWeight: 600, color: TEXT, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Analisis</TableHead>
                      <TableHead style={{ fontWeight: 600, color: TEXT, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', textAlign: 'right' }}>Potensi</TableHead>
                      <TableHead style={{ fontWeight: 600, color: TEXT, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow><TableCell colSpan={8} style={{ textAlign: 'center', padding: '32px', color: MUTED, fontSize: 13 }}>Tidak ada data</TableCell></TableRow>
                    ) : (
                      filteredData.map((row, idx) => {
                        const statusColors = getStatusColor(row['Status Analisis'] || '')
                        return (
                          <TableRow key={idx} style={{ borderBottom: `1px solid ${BORDER}` }}>
                            <TableCell style={{ fontSize: 13, color: MUTED, whiteSpace: 'nowrap' }}>{row.NO}</TableCell>
                            <TableCell style={{ fontSize: 13, color: TEXT, fontWeight: 500, whiteSpace: 'nowrap', minWidth: 180 }}>{row['Nama Debitur']}</TableCell>
                            <TableCell style={{ fontSize: 13, color: TEXT, whiteSpace: 'nowrap' }}>{(row as unknown as Record<string, string>)['BULAN'] || '-'}</TableCell>
                            <TableCell style={{ fontSize: 13, color: TEXT, whiteSpace: 'nowrap' }}>{row['Nama Referral'] || '-'}</TableCell>
                            <TableCell style={{ fontSize: 13, color: TEXT, whiteSpace: 'nowrap' }}>{(row as unknown as Record<string, string>)['PRODUK'] || row['Nama Analis'] || '-'}</TableCell>
                            <TableCell style={{ fontSize: 13, color: TEXT, whiteSpace: 'nowrap' }}>{(row as unknown as Record<string, string>)['ANALISIS'] || '-'}</TableCell>
                            <TableCell style={{ fontSize: 13, color: TEXT, fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>{formatRupiah(Number(row['Potensi Pembiayaan']) || 0)}</TableCell>
                            <TableCell style={{ whiteSpace: 'nowrap' }}>
                              <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: statusColors.bg, color: statusColors.text }}>{row['Status Analisis'] || 'N/A'}</span>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </div>

      {showAddForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }} onClick={() => setShowAddForm(false)}>
          <div style={{ background: '#fff', borderRadius: 12, maxWidth: 500, width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Tambah Data Debitur</div>
              <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: MUTED, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleSubmitForm} style={{ padding: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Nama Debitur *</label><input type="text" required value={formData.namaDebitur} onChange={e => setFormData(prev => ({ ...prev, namaDebitur: e.target.value }))} style={{ width: '100%', height: 38, padding: '0 12px', fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6 }} /></div>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Bulan</label><input type="text" value={formData.bulan} onChange={e => setFormData(prev => ({ ...prev, bulan: e.target.value }))} style={{ width: '100%', height: 38, padding: '0 12px', fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6 }} /></div>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Pemberi Reff</label><input type="text" value={formData.pemberiReff} onChange={e => setFormData(prev => ({ ...prev, pemberiReff: e.target.value }))} style={{ width: '100%', height: 38, padding: '0 12px', fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6 }} /></div>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Produk</label><input type="text" value={formData.produk} onChange={e => setFormData(prev => ({ ...prev, produk: e.target.value }))} style={{ width: '100%', height: 38, padding: '0 12px', fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6 }} /></div>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Analisis</label><input type="text" value={formData.analisis} onChange={e => setFormData(prev => ({ ...prev, analisis: e.target.value }))} style={{ width: '100%', height: 38, padding: '0 12px', fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6 }} /></div>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Potensi Pembiayaan</label><input type="number" value={formData.potensiPembiayaan} onChange={e => setFormData(prev => ({ ...prev, potensiPembiayaan: e.target.value }))} style={{ width: '100%', height: 38, padding: '0 12px', fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6 }} /></div>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Status</label><input type="text" value={formData.status} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))} style={{ width: '100%', height: 38, padding: '0 12px', fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6 }} /></div>
                <button type="submit" disabled={submitting} style={{ height: 40, fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none', background: ORANGE, color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}>{submitting ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
