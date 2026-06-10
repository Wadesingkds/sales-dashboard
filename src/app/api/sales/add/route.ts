import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const appsScriptUrl = process.env.APPS_SCRIPT_URL

    if (!appsScriptUrl) {
      return NextResponse.json(
        { success: false, message: 'Apps Script URL not configured' },
        { status: 500 }
      )
    }

    const res = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      redirect: 'follow'
    })

    const data = await res.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('[add-data] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to add data' },
      { status: 500 }
    )
  }
}
