import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Table } from './Table'
import { Tag } from './Tag'

/**
 * Story arg names are the contract. `density` is the variant axis; `caption` is optional
 * text with a `captionVisible` boolean; `columns` and `rows` are content, so the Figma set
 * draws a representative three-column table.
 */
const meta = {
  title: 'Components/Table',
  component: Table,
  argTypes: {
    density: { control: 'inline-radio', options: ['comfortable', 'compact'], description: 'Row height.' },
    caption: { control: 'text', description: 'What the table holds. Omit to hide.' },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const columns = [
  { key: 'token', header: 'Token' },
  { key: 'role', header: 'Role' },
  { key: 'contrast', header: 'Contrast', align: 'end' as const },
]

const rows = [
  { token: 'color/ink', role: 'Primary text', contrast: '17.80:1' },
  { token: 'color/muted', role: 'Secondary text', contrast: '6.35:1' },
  { token: 'color/faint', role: 'Placeholders', contrast: '4.59:1' },
]

export const Default: Story = {
  args: { columns, rows, caption: 'Colour roles on canvas, dark theme', density: 'comfortable' },
}

export const Compact: Story = {
  args: { columns, rows, caption: 'Colour roles on canvas, dark theme', density: 'compact' },
}

export const WithTags: Story = {
  args: {
    density: 'compact',
    columns: [
      { key: 'email', header: 'Email' },
      { key: 'status', header: 'Status' },
      { key: 'joined', header: 'Joined', align: 'end' as const },
    ],
    rows: [
      { email: 'a@studio.com', status: <Tag label="Confirmed" tone="success" />, joined: '02 Oct' },
      { email: 'b@studio.com', status: <Tag label="Pending" tone="muted" />, joined: '03 Oct' },
      { email: 'c@studio.com', status: <Tag label="Bounced" tone="danger" />, joined: '04 Oct' },
    ],
  },
}
