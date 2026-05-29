'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className='space-y-1 text-center'>
        <CardTitle className='text-xl'>Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form className='space-y-4' onSubmit={(e) => e.preventDefault()}>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' type='email' placeholder='you@example.com' required />
          </div>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='password'>Password</Label>
              <Link href='/auth/forgot-password' className='text-muted-foreground hover:text-foreground text-xs'>
                Forgot password?
              </Link>
            </div>
            <Input id='password' type='password' placeholder='••••••••' required />
          </div>
          <Button type='submit' className='w-full'>
            Sign in
          </Button>
          <p className='text-muted-foreground text-center text-sm'>
            Don&apos;t have an account?{' '}
            <Link href='/auth/register' className='text-foreground hover:underline'>
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
