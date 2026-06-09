export interface SalesRow {
  rowIndex: number;
  namaRefferal: string;
  tanggalKunjungan: string;
  namaDebitur: string;
  produk: string;
  namaAnalisis: string;
  potensipembiayaan: string;
  statusAnalisis: string;
  timestamp: string;
}

export async function fetchSalesData(): Promise<SalesRow[]> {
  const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL!;
  const res = await fetch(`${APPS_SCRIPT_URL}?action=getData`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal fetch data');
  const json = await res.json();
  return json.data as SalesRow[];
}

export async function updateStatus(rowIndex: number, status: string): Promise<void> {
  const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL!;
  await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'updateStatus', rowIndex, status }),
  });
}

export async function submitSalesData(data: Omit<SalesRow, 'rowIndex' | 'statusAnalisis' | 'timestamp'>): Promise<void> {
  const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL!;
  await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(data),
  });
}
