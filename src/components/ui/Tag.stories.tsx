import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Tag } from './Tag'

/**
 * Story arg names are the contract. `tone` becomes the Figma variant axis and
 * `label` the text property.
 */
const meta = {
  title: 'Components/Tag',
  component: Tag,
  argTypes: {
    label: { control: 'text', description: 'Catalogue text. Middle dots between parts.' },
    tone: {
      control: 'inline-radio',
      options: ['sample', 'muted', 'success', 'info', 'warn', 'danger'],
      description: 'sample for catalogue labels, muted for inert metadata, status tones for state.',
    },
  },
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'SPC-000 · PRE-RELEASE', tone: 'sample' },
}

export const Muted: Story = {
  args: { label: 'Draft', tone: 'muted' },
}

export const Success: Story = {
  args: { label: 'Stable', tone: 'success' },
}

export const Info: Story = {
  args: { label: 'Beta', tone: 'info' },
}

export const Warn: Story = {
  args: { label: 'Breaking', tone: 'warn' },
}

export const Danger: Story = {
  args: { label: 'Deprecated', tone: 'danger' },
}

/** Every tone in a row, the way a changelog or a table column would use them. */
export const AllTones: Story = {
  args: { label: 'Label', tone: 'sample' },
  render: () => (
    <div className="flex flex-wrap items-center gap-md">
      <Tag label="SPC-014 · BUTTON" tone="sample" />
      <Tag label="Draft" tone="muted" />
      <Tag label="Stable" tone="success" />
      <Tag label="Beta" tone="info" />
      <Tag label="Breaking" tone="warn" />
      <Tag label="Deprecated" tone="danger" />
    </div>
  ),
}
