import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Badge } from './Badge'

/**
 * Story arg names are the contract. `label` is the text property; `tone` the variant axis;
 * `dot` a boolean. The spoken label is the native aria-label, so it has no Figma property.
 */
const meta = {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    label: { control: 'text', description: 'A count or one short word.' },
    tone: { control: 'inline-radio', options: ['sample', 'muted', 'danger'], description: 'sample new, danger attention, muted neutral.' },
    dot: { control: 'boolean', description: 'The dot alone, without the label.' },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: '3', tone: 'sample', dot: false, 'aria-label': '3 unread messages' },
}

export const Danger: Story = {
  args: { label: '12', tone: 'danger', 'aria-label': '12 failed payments' },
}

export const Muted: Story = {
  args: { label: '99+', tone: 'muted', 'aria-label': 'More than 99 invoices' },
}

export const Dot: Story = {
  args: { label: 'New', tone: 'sample', dot: true, 'aria-label': 'New activity' },
}

/** Beside the labels it counts, as in a sidebar. */
export const InContext: Story = {
  args: { label: '3' },
  render: () => (
    <ul className="m-0 flex w-9xl list-none flex-col gap-sm p-0 font-mono text-body text-ink">
      <li className="flex items-center justify-between">
        Inbox <Badge label="3" aria-label="3 unread" />
      </li>
      <li className="flex items-center justify-between">
        Failed <Badge label="12" tone="danger" aria-label="12 failed" />
      </li>
      <li className="flex items-center justify-between">
        Archive <Badge label="99+" tone="muted" aria-label="More than 99" />
      </li>
    </ul>
  ),
}
