import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Banner } from './Banner'
import { Button } from './Button'

/**
 * Story arg names are the contract. `message` is the text property; `tone` is the variant
 * axis; `action` swaps in an instance (a link or a small Button). The dismiss control appears
 * in code when onDismiss is passed; Figma draws it on every variant, as Toast does.
 */
const meta = {
  title: 'Components/Banner',
  component: Banner,
  argTypes: {
    message: { control: 'text', description: 'One or two sentences about the whole app or page.' },
    tone: { control: 'inline-radio', options: ['info', 'success', 'warn', 'danger'], description: 'Status colour of the fill and the rule.' },
  },
  // Fullscreen, because a banner runs edge to edge across the top of the page.
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Banner>

export default meta
type Story = StoryObj<typeof meta>

/** A link in the banner is underlined, so it reads as a link without relying on colour. */
const link = (label: string, href: string) => (
  <a href={href} className="rounded-sm font-mono text-body text-ink underline transition-colors duration-fast hover:text-muted">
    {label}
  </a>
)

export const Default: Story = {
  args: {
    message: 'Scheduled maintenance on Sunday 12 October, 02:00 to 04:00 UTC. Invoicing will be read-only.',
    tone: 'info',
    action: link('View status page', '#status'),
    onDismiss: () => {},
  },
}

export const TrialEnding: Story = {
  args: {
    message: 'Your trial ends in 3 days. Add a payment method to keep Harbour & Hale running.',
    tone: 'warn',
    action: <Button label="Add payment method" variant="secondary" size="sm" />,
  },
}

export const NewFeature: Story = {
  args: {
    message: 'Recurring invoices are here. Set a schedule once and every client is billed on time.',
    tone: 'success',
    action: link('Set up recurring invoices', '#recurring'),
    onDismiss: () => {},
  },
}

export const Danger: Story = {
  args: {
    message: 'Payments are failing for some card customers. We are working on a fix.',
    tone: 'danger',
    action: link('Follow the incident', '#incident'),
  },
}

export const MessageOnly: Story = {
  args: { message: 'You are viewing Harbour & Hale as a guest. Changes are not saved.', tone: 'info' },
}

/** In place: across the top of the app, above the page header, pushing the page down rather than covering it. */
export const InPage: Story = {
  args: {
    message: 'Your trial ends in 3 days. Add a payment method to keep Harbour & Hale running.',
    tone: 'warn',
    onDismiss: () => {},
  },
  render: (args) => (
    <div className="flex min-h-dvh flex-col">
      <Banner {...args} />
      <div className="flex flex-col gap-sm border-b border-line px-2xl py-xl">
        <h1 className="m-0 text-heading font-medium tracking-display text-ink">Invoices</h1>
        <p className="m-0 font-text text-body text-muted">42 open, £18,460 outstanding.</p>
      </div>
    </div>
  ),
}
