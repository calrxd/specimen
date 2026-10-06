import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Chip } from './Chip'

/**
 * Story arg names are the contract. `label` is the text property; `removable`, `dot` and
 * `disabled` are booleans; `onRemove` is behaviour, with no Figma property.
 */
const meta = {
  title: 'Components/Chip',
  component: Chip,
  argTypes: {
    label: { control: 'text', description: 'The value the chip stands for.' },
    removable: { control: 'boolean', description: 'Shows the remove control.' },
    dot: { control: 'boolean', description: 'Green dot for an active filter.' },
    disabled: { control: 'boolean', description: 'Inert.' },
  },
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Harbour & Hale', removable: false, dot: false, disabled: false },
}

export const Removable: Story = {
  args: { label: 'Overdue', removable: true, onRemove: () => {} },
}

export const ActiveFilter: Story = {
  args: { label: 'Status: failed', removable: true, dot: true, onRemove: () => {} },
}

export const Disabled: Story = {
  args: { label: 'Archived', removable: true, disabled: true },
}

/** How chips sit in a filter bar. */
export const Group: Story = {
  args: { label: 'Overdue' },
  render: () => (
    <div className="flex flex-wrap gap-sm">
      <Chip label="Status: failed" dot removable onRemove={() => {}} />
      <Chip label="Over £1,000" removable onRemove={() => {}} />
      <Chip label="Last 30 days" removable onRemove={() => {}} />
    </div>
  ),
}
