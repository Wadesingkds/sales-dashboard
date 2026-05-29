'use client'

import type { ReactNode } from 'react'

import { AppHeader, AppShell, AppSidebar, WorkspaceSwitcher } from '@/components/app-shell'
import { dashboardNav } from '@/config/nav'
import { workspaces } from '@/config/workspaces'

export default function ChartsLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      sidebar={
        <AppSidebar
          config={dashboardNav}
          isActive={(url) => url === '/charts'}
          header={<WorkspaceSwitcher workspaces={workspaces} />}
        />
      }
      header={
        <AppHeader>
          <span className='text-sm font-medium'>Charts</span>
        </AppHeader>
      }
    >
      <div className='space-y-6'>{children}</div>
    </AppShell>
  )
}
