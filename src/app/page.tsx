import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')

  if (token) {
    redirect('/dashboard')
  } else {
    redirect('/auth/login')
  }
}
