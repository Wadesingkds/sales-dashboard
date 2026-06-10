import { NextResponse } from 'next/server';
import { fetchSalesData, getSummaryStats } from '@/lib/sheets';

// Force dynamic rendering — jangan cache response ini di server
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchSalesData();
    const summary = getSummaryStats(data);

    return NextResponse.json(
      { data, summary },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';

    console.error('[API /api/sales] Error:', message);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
