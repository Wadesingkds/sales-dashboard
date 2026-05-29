'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/showcase'

export default function SettingsPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Settings' description='Manage your account profile, preferences, and security.' />

      <Tabs defaultValue='profile' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='profile'>Profile</TabsTrigger>
          <TabsTrigger value='notifications'>Notifications</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
        </TabsList>

        <TabsContent value='profile' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update how others see you across the workspace.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='first-name'>First name</Label>
                  <Input id='first-name' defaultValue='Jane' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='last-name'>Last name</Label>
                  <Input id='last-name' defaultValue='Doe' />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' type='email' defaultValue='jane@example.com' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='bio'>Bio</Label>
                <Textarea id='bio' rows={4} placeholder='A short description about yourself' />
              </div>
              <Separator />
              <div className='flex justify-end gap-2'>
                <Button variant='outline'>Cancel</Button>
                <Button>Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='notifications' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose how we get in touch.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {[
                { id: 'email-updates', label: 'Product updates', desc: 'Newsletter and feature announcements.' },
                { id: 'security', label: 'Security alerts', desc: 'Sign-ins from new devices and password changes.' },
                { id: 'marketing', label: 'Marketing emails', desc: 'Promotional offers and surveys.' }
              ].map((item) => (
                <div key={item.id} className='flex items-start justify-between gap-4 rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <Label htmlFor={item.id} className='text-sm'>
                      {item.label}
                    </Label>
                    <p className='text-muted-foreground text-sm'>{item.desc}</p>
                  </div>
                  <Switch id={item.id} defaultChecked={item.id !== 'marketing'} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='security' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password regularly to keep your account safe.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='current-password'>Current password</Label>
                <Input id='current-password' type='password' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='new-password'>New password</Label>
                <Input id='new-password' type='password' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='confirm-password'>Confirm password</Label>
                <Input id='confirm-password' type='password' />
              </div>
              <Separator />
              <div className='flex justify-end'>
                <Button>Update password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
