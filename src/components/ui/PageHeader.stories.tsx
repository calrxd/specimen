import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Breadcrumb } from './Breadcrumb'
import { Button } from './Button'
import { PageHeader } from './PageHeader'

/**
 * Story arg names are the contract. `title` is the text property; `description` is optional
 * text with a `descriptionVisible` boolean; `breadcrumb` and `actions` are instance swaps.
 */
const meta = {
  title: 'Components/PageHeader',
  component: PageHeader,
  argTypes: {
    title: { control: 'text', description: 'The screen name.' },
    description: { control: 'text', description: 'What the screen is for. Omit to hide.' },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Billing overview',
    description: 'Revenue, failed payments and overdue invoices across every workspace.',
    actions: <Button label="New invoice" />,
  },
}

export const WithBreadcrumb: Story = {
  args: {
    title: 'INV-2048',
    description: 'Harbour & Hale, due on 3 October.',
    breadcrumb: <Breadcrumb items={[{ label: 'Billing', href: '#b' }, { label: 'Invoices', href: '#i' }, { label: 'INV-2048' }]} />,
    actions: (
      <>
        <Button label="Send reminder" variant="secondary" />
        <Button label="Retry payment" />
      </>
    ),
  },
}

export const TitleOnly: Story = {
  args: { title: 'Settings' },
}
