import Papa from 'papaparse';

// ===== Interfaces =====

export interface SalesData {
  NO: string;
  'Nama Referral': string;
  'Tanggal Kunjungan': string;
  'Nama Debitur': string;
  Produk: string;
  'Nama Analis': string;
  'Potensi Pembiayaan': number;
  'Status Analisis': string;
  Timestamp: string;
  // legacy column names from old sheet
  BULAN?: string;
  PRODUK?: string;
  ANALISIS?: string;
  [key: string]: unknown;
}

export type RawRow = Record<string, string>;

export interface SummaryStats {
  totalPotensi: number;
  totalDebitur: number;
  byReferral: Record<string, number>;
  byStatus: Record<string, number>;
  byBulan: Record<string, number>;
}

// ===== Helper Functions =====

/**
 * Parses a Rupiah-formatted string to a number.
 * Strips non-numeric characters except dots, removes commas, then parseFloat.
 */
export function parseRupiah(value: string): number {
  if (!value || typeof value !== 'string') return 0;

  // Remove thousand-separator dots used in Indonesian format (1.000.000)
  // and strip any non-numeric character except comma (which acts as decimal)
  // Common formats: "Rp 1.500.000", "1,500,000", "1.500.000"
  const cleaned = value
    .replace(/[^\d.,]/g, '')  // keep digits, dots, commas
    .replace(/\./g, '')        // remove dots (thousand separators in ID format)
    .replace(/,/g, '.');       // replace comma with dot (decimal)

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Maps a raw CSV row (with old/inconsistent column names) to a normalized SalesData object.
 */
export function normalizeRow(row: RawRow): SalesData {
  return {
    NO: row['NO'] ?? row['No'] ?? row['no'] ?? '',
    'Nama Referral': row['Nama Referral'] ?? row['PEMBERI REFF'] ?? '',
    'Tanggal Kunjungan': row['Tanggal Kunjungan'] ?? row['BULAN'] ?? '',
    'Nama Debitur': row['Nama Debitur'] ?? row['NAMA CALON DEBITUR'] ?? '',
    Produk: row['Produk'] ?? row['PRODUK'] ?? '',
    'Nama Analis': row['Nama Analis'] ?? row['NAMA ANALIS'] ?? '',
    'Potensi Pembiayaan': parseRupiah(
      row['Potensi Pembiayaan'] ?? row['POTENSI PEMBIAYAAN'] ?? '0'
    ),
    'Status Analisis': row['Status Analisis'] ?? row['STATUS ANALISIS'] ?? row['STATUS'] ?? '',
    Timestamp: row['Timestamp'] ?? row['TIMESTAMP'] ?? '',
  };
}

// ===== Data Fetching =====

const SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1lk17k7LnxaAsMjxnwtu7U9FuM_FWnBKRIlcVKRNbWWs/export?format=csv&gid=0';

/**
 * Fetches sales data from Google Sheets (exported as CSV),
 * normalizes columns, and filters out incomplete rows.
 */
export async function fetchSalesData(): Promise<SalesData[]> {
  const response = await fetch(SHEETS_CSV_URL, {
    cache: 'no-store',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Google Sheets CSV: ${response.status} ${response.statusText}`
    );
  }

  const csvText = await response.text();

  const result = Papa.parse<RawRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors && result.errors.length > 0) {
    console.warn('[sheets] PapaParse warnings:', result.errors);
  }

  const normalized = result.data.map(normalizeRow);

  // Filter: baris valid harus punya NO dan Nama Debitur
  const filtered = normalized.filter(
    (row) =>
      row.NO.trim() !== '' &&
      row['Nama Debitur'].trim() !== ''
  );

  return filtered;
}

// ===== Summary / Aggregation =====

/**
 * Computes summary statistics from an array of SalesData.
 */
export function getSummaryStats(data: SalesData[]): SummaryStats {
  const totalPotensi = data.reduce(
    (sum, row) => sum + (row['Potensi Pembiayaan'] ?? 0),
    0
  );

  const totalDebitur = data.length;

  const byReferral: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byBulan: Record<string, number> = {};

  for (const row of data) {
    // Group by Referral
    const referral = (row['Nama Referral']?.trim() || '(Tidak Diketahui)').toUpperCase();
    byReferral[referral] = (byReferral[referral] ?? 0) + 1;

    // Group by Status Analisis
    const status = row['Status Analisis']?.trim() || '(Tidak Ada Status)';
    byStatus[status] = (byStatus[status] ?? 0) + 1;

    // Group by Tanggal Kunjungan (bulan)
    const bulan = (row['Tanggal Kunjungan']?.trim() || '(Tidak Diketahui)').toUpperCase();
    byBulan[bulan] = (byBulan[bulan] ?? 0) + 1;
  }

  return {
    totalPotensi,
    totalDebitur,
    byReferral,
    byStatus,
    byBulan,
  };
}
