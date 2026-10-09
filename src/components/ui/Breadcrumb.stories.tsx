import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Breadcrumb } from './Breadcrumb'

/**
 * Story arg names are the contract. `items` is content, so the Figma component draws three
 * levels; The accessible name is the native aria-label, so it has no Figma property.
 */
const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  argTypes: {
  },
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: [
      { label: 'Billing', href: '#billing' },
      { label: 'Invoices', href: '#invoices' },
      { label: 'INV-2048' },
    ],
  },
}

export const TwoLevels: Story = {
  args: {
    'aria-label': 'Settings location',
    items: [{ label: 'Settings', href: '#settings' }, { label: 'Team' }],
  },
}

export const Deep: Story = {
  args: {
    'aria-label': 'Project location',
    items: [
      { label: 'Workspaces', href: '#w' },
      { label: 'Harbour & Hale', href: '#h' },
      { label: 'Projects', href: '#p' },
      { label: 'Website refresh', href: '#r' },
      { label: 'Tasks' },
    ],
  },
}
