import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ReactNode } from 'react'
import { AppSidebar, type AppSidebarGroup } from './AppSidebar'

/** Narrow the viewport below 768px to see the Menu button and drawer. */
const meta = {
  title: 'Components/AppSidebar',
  component: AppSidebar,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="flex h-[36rem] flex-col md:flex-row">
        <Story />
        <div className="flex-1 p-3xl font-text text-body text-muted">Page content</div>
      </div>
    ),
  ],
} satisfies Meta<typeof AppSidebar>

export default meta
type Story = StoryObj<typeof meta>

const icon = (d: string): ReactNode => (
  <svg viewBox="0 0 16 16" className="size-md">
    <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const groups: AppSidebarGroup[] = [
  {
    id: 'main',
    items: [
      { id: 'overview', label: 'Overview', href: '#overview', icon: icon('M2.5 2.5h4.5v4.5H2.5zM9 2.5h4.5v4.5H9zM2.5 9h4.5v4.5H2.5zM9 9h4.5v4.5H9z') },
      { id: 'invoices', label: 'Invoices', href: '#invoices', icon: icon('M3.5 1.5h9v13l-2-1.2-2.5 1.2-2.5-1.2-2 1.2zM6 5.5h4M6 8.5h4'), badge: 12, badgeTone: 'danger' },
      { id: 'customers', label: 'Customers', href: '#customers', icon: icon('M8 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 14c.5-2.8 2.5-4.5 5-4.5s4.5 1.7 5 4.5') },
      { id: 'reports', label: 'Reports', href: '#reports', icon: icon('M2.5 13.5h11M4.5 11V7M8 11V3.5M11.5 11V8.5') },
    ],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { id: 'team', label: 'Team', href: '#team', icon: icon('M5.5 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM11 7a2 2 0 1 0 0-4M1.5 13c.4-2.3 2-3.5 4-3.5s3.6 1.2 4 3.5M11 9.5c1.8 0 3.1 1.2 3.5 3.5') },
      { id: 'integrations', label: 'Integrations', href: '#integrations', icon: icon('M6 2.5v3M10 2.5v3M4.5 5.5h7v3a3.5 3.5 0 0 1-7 0zM8 12v2'), badge: 'New' },
      { id: 'settings', label: 'Settings', href: '#settings', icon: icon('M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4') },
    ],
  },
]

const footer = (
  <div className="flex flex-col">
    <span className="text-caption text-ink">Harbour & Hale</span>
    <span className="font-text text-caption text-muted">Team plan · 14 seats</span>
  </div>
)

export const Default: Story = {
  args: { brand: 'specimen_ billing', groups, activeId: 'invoices', footer },
}

export const Collapsed: Story = {
  args: { brand: 'specimen_ billing', groups, activeId: 'overview', defaultCollapsed: true, footer },
}

export const WithoutIcons: Story = {
  args: {
    brand: 'specimen_ rota',
    activeId: 'week',
    groups: [
      { id: 'plan', items: [{ id: 'week', label: 'This week', href: '#week' }, { id: 'requests', label: 'Swap requests', href: '#requests', badge: 3 }, { id: 'leave', label: 'Leave', href: '#leave' }] },
      { id: 'people', label: 'People', items: [{ id: 'staff', label: 'Staff', href: '#staff' }, { id: 'sites', label: 'Sites', href: '#sites' }] },
    ],
  },
}
