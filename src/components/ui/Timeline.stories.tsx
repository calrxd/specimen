import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Timeline } from './Timeline'

/**
 * Story arg names are the contract. `items` is content, so the Figma component draws four
 * events with one in each of muted, sample, success and danger; `label` is optional text.
 */
const meta = {
  title: 'Components/Timeline',
  component: Timeline,
  argTypes: {
    label: { control: 'text', description: 'Names the list when no heading sits above it.' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Timeline>

export default meta
type Story = StoryObj<typeof meta>

const activity = [
  {
    id: 'a1',
    time: '6 Oct 2026, 09:12',
    dateTime: '2026-10-06T09:12',
    title: 'Invoice INV-2048 sent',
    description: 'Emailed to accounts@harbourhale.co.uk for £1,216.',
    tone: 'sample' as const,
  },
  {
    id: 'a2',
    time: '3 Oct 2026, 16:40',
    dateTime: '2026-10-03T16:40',
    title: 'Card payment declined',
    description: 'Visa ending 4417. Retried automatically on 10 October.',
    tone: 'danger' as const,
  },
  {
    id: 'a3',
    time: '1 Oct 2026, 14:05',
    dateTime: '2026-10-01T14:05',
    title: 'Seats increased from 38 to 42',
    description: 'Changed by Maya Okafor.',
    tone: 'muted' as const,
  },
  {
    id: 'a4',
    time: '28 Sep 2026, 11:05',
    dateTime: '2026-09-28T11:05',
    title: 'Payment of £1,216 received',
    description: 'Invoice INV-2028, paid by bank transfer.',
    tone: 'success' as const,
  },
]

export const Default: Story = {
  args: { items: activity, label: 'Account activity' },
}

/** An audit log of routine changes: every marker muted, no detail lines. */
export const AuditLog: Story = {
  args: {
    label: 'Audit log',
    items: [
      { id: 'l1', time: '7 Oct 2026, 10:31', dateTime: '2026-10-07T10:31', title: 'Ruth Calder changed the billing contact', tone: 'muted' },
      { id: 'l2', time: '7 Oct 2026, 10:29', dateTime: '2026-10-07T10:29', title: 'Ruth Calder signed in from Leeds', tone: 'muted' },
      { id: 'l3', time: '6 Oct 2026, 17:02', dateTime: '2026-10-06T17:02', title: 'Kofi Mensah exported 1,820 invoices', tone: 'muted' },
      { id: 'l4', time: '6 Oct 2026, 08:45', dateTime: '2026-10-06T08:45', title: 'Two-factor authentication turned on', tone: 'muted' },
    ],
  },
}

/** Every tone, in the order an onboarding usually runs. */
export const Tones: Story = {
  args: {
    label: 'Onboarding for Saltmarsh Foods',
    items: [
      { id: 't1', time: '9 Oct 2026', dateTime: '2026-10-09', title: 'Go-live booked', description: 'Kofi Mensah, 15:00.', tone: 'sample' },
      { id: 't2', time: '8 Oct 2026', dateTime: '2026-10-08', title: 'Xero import finished', description: '1,820 invoices imported.', tone: 'success' },
      { id: 't3', time: '7 Oct 2026', dateTime: '2026-10-07', title: 'VAT number still missing', description: 'Setup cannot finish without it.', tone: 'warn' },
      { id: 't4', time: '6 Oct 2026', dateTime: '2026-10-06', title: 'Import check scheduled', tone: 'info' },
      { id: 't5', time: '5 Oct 2026', dateTime: '2026-10-05', title: 'Import from Sage failed', description: 'The export file was empty.', tone: 'danger' },
      { id: 't6', time: '2 Oct 2026', dateTime: '2026-10-02', title: 'Workspace created', tone: 'muted' },
    ],
  },
}
