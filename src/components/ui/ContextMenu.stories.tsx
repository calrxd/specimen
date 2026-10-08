import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ContextMenu, type ContextMenuItem } from './ContextMenu'

/** Right-click the row, long-press it on touch, or focus it and press Shift F10. */
const meta = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContextMenu>

export default meta
type Story = StoryObj<typeof meta>

const noop = () => {}

const invoiceActions: ContextMenuItem[] = [
  { id: 'open', label: 'Open invoice', onSelect: noop, shortcut: 'Enter' },
  { id: 'copy', label: 'Copy link', onSelect: noop, shortcut: 'Ctrl C' },
  { id: 'remind', label: 'Send reminder', onSelect: noop },
  { id: 's1', separator: true },
  { id: 'paid', label: 'Mark as paid', onSelect: noop },
  { id: 'refund', label: 'Refund', onSelect: noop, disabled: true },
  { id: 's2', separator: true },
  { id: 'void', label: 'Void invoice', onSelect: noop, tone: 'danger' },
]

const Row = () => (
  <div className="flex w-full max-w-measure-md items-center justify-between rounded-sm border border-line bg-surface px-lg py-md text-body">
    <span className="text-ink">INV-2048 · Harbour & Hale</span>
    <span className="text-caption text-muted">£1,240 · overdue</span>
  </div>
)

export const Default: Story = {
  args: { label: 'Invoice INV-2048', items: invoiceActions, children: <Row /> },
}

export const OnACard: Story = {
  args: {
    label: 'Shift: Tuesday early',
    items: [
      { id: 'edit', label: 'Edit shift', onSelect: noop },
      { id: 'dup', label: 'Duplicate to next week', onSelect: noop },
      { id: 'swap', label: 'Offer swap', onSelect: noop },
      { id: 's', separator: true },
      { id: 'del', label: 'Delete shift', onSelect: noop, tone: 'danger' },
    ],
    children: (
      <div className="flex w-full max-w-measure-sm flex-col gap-xs rounded-md border border-line bg-surface p-lg">
        <span className="text-body text-ink">Tuesday early</span>
        <span className="font-text text-caption text-muted">07:00 to 15:00 · Front desk · Priya N.</span>
      </div>
    ),
  },
}
