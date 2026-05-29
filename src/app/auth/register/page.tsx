'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className='space-y-1 text-center'>
        <CardTitle className='text-xl'>Create an account</CardTitle>
        <CardDescription>Get started with a free account today</CardDescription>
      </CardHeader>
      <CardContent>
        <form className='space-y-4' onSubmit={(e) => e.preventDefault()}>
          <div className='space-y-2'>
            <Label htmlFor='name'>Full name</Label>
            <Input id='name' placeholder='Jane Doe' required />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' type='email' placeholder='you@example.com' required />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input id='password' type='password' placeholder='At least 8 characters' required />
          </div>
          <Button type='submit' className='w-full'>
            Create account
          </Button>
          <p className='text-muted-foreground text-center text-sm'>
            Already have an account?{' '}
            <Link href='/auth/login' className='text-foreground hover:underline'>
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
