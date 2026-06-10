import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import DashboardClient from './dashboard-client'

export const dynamic = 'force-dynamic'

export default async function SalesDashboard() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')
  
  if (!token) {
    redirect('/auth/login')
  }

  return <DashboardClient />
}
