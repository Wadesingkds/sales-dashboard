'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader className='space-y-1 text-center'>
        <CardTitle className='text-xl'>Reset password</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send you a reset link</CardDescription>
      </CardHeader>
      <CardContent>
        <form className='space-y-4' onSubmit={(e) => e.preventDefault()}>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' type='email' placeholder='you@example.com' required />
          </div>
          <Button type='submit' className='w-full'>
            Send reset link
          </Button>
          <p className='text-muted-foreground text-center text-sm'>
            Remember your password?{' '}
            <Link href='/auth/login' className='text-foreground hover:underline'>
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
