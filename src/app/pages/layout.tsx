'use client'

import type { ReactNode } from 'react'

import { AppHeader, AppShell, AppSidebar, WorkspaceSwitcher } from '@/components/app-shell'
import { dashboardNav } from '@/config/nav'
import { workspaces } from '@/config/workspaces'

export default function PagesLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      sidebar={
        <AppSidebar
          config={dashboardNav}
          header={<WorkspaceSwitcher workspaces={workspaces} />}
        />
      }
      header={
        <AppHeader>
          <span className='text-sm font-medium'>Pages</span>
        </AppHeader>
      }
    >
      <div className='space-y-6'>{children}</div>
    </AppShell>
  )
}
