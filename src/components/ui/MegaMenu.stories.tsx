import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MegaMenu, type MegaMenuEntry } from './MegaMenu'

/** Click an entry, or focus the bar and press Down. Arrow keys move through the panel. */
const meta = {
  title: 'Components/MegaMenu',
  component: MegaMenu,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div style={{ minHeight: 420 }}><Story /></div>],
} satisfies Meta<typeof MegaMenu>

export default meta
type Story = StoryObj<typeof meta>

const entries: MegaMenuEntry[] = [
  {
    id: 'product',
    label: 'Product',
    columns: [
      {
        id: 'get-paid',
        heading: 'Get paid',
        links: [
          { id: 'invoices', label: 'Invoices', href: '#invoices', description: 'Send, chase and reconcile in one place.' },
          { id: 'links', label: 'Payment links', href: '#links', description: 'A link that takes a card in two taps.' },
          { id: 'subs', label: 'Subscriptions', href: '#subs', description: 'Plans, trials and proration.' },
        ],
      },
      {
        id: 'report',
        heading: 'Report',
        links: [
          { id: 'revenue', label: 'Revenue', href: '#revenue', description: 'MRR, churn and expansion by month.' },
          { id: 'tax', label: 'VAT returns', href: '#tax', description: 'Figures ready for HMRC.' },
        ],
      },
    ],
    feature: (
      <div className="flex flex-col gap-xs">
        <span className="text-label uppercase text-sample tracking-label">New</span>
        <span className="text-body text-ink">Dunning, done for you</span>
        <span className="font-text text-caption leading-normal text-muted">Failed payments retry on the best day for each card.</span>
      </div>
    ),
  },
  {
    id: 'customers',
    label: 'Customers',
    columns: [
      {
        id: 'teams',
        heading: 'By team',
        links: [
          { id: 'finance', label: 'Finance', href: '#finance' },
          { id: 'ops', label: 'Operations', href: '#ops' },
        ],
      },
      {
        id: 'size',
        heading: 'By size',
        links: [
          { id: 'startups', label: 'Startups', href: '#startups' },
          { id: 'scale', label: 'Scale-ups', href: '#scale' },
          { id: 'enterprise', label: 'Enterprise', href: '#enterprise' },
        ],
      },
    ],
  },
  { id: 'pricing', label: 'Pricing', href: '#pricing' },
  { id: 'docs', label: 'Docs', href: '#docs' },
]

export const Default: Story = {
  args: { label: 'Product', entries },
}

export const LinksOnly: Story = {
  args: { label: 'Site', entries: entries.filter((e) => !e.columns) },
}
