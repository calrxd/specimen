import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Card } from './Card'
import { DescriptionList } from './DescriptionList'
import { Tag } from './Tag'

/**
 * Story arg names are the contract. `layout` is the variant axis; `columns` is a number and
 * `items` content, so the Figma set draws four details in one column for each layout.
 */
const meta = {
  title: 'Components/DescriptionList',
  component: DescriptionList,
  argTypes: {
    layout: { control: 'inline-radio', options: ['horizontal', 'stacked'], description: 'Term beside or above its value.' },
    columns: { control: 'inline-radio', options: [1, 2, 3], description: 'Columns from md up.' },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DescriptionList>

export default meta
type Story = StoryObj<typeof meta>

const account = [
  { term: 'Billing contact', description: 'Maya Okafor' },
  { term: 'Email', description: 'accounts@harbourhale.co.uk' },
  { term: 'Customer since', description: '14 March 2024' },
  { term: 'VAT number', description: 'GB 284 1937 06' },
]

export const Default: Story = {
  args: { items: account, layout: 'horizontal', columns: 1 },
  decorators: [
    (Story) => (
      <div className="max-w-measure-md">
        <Story />
      </div>
    ),
  ],
}

/** Short figures in a grid, term above value, the way an invoice header reads. */
export const Stacked: Story = {
  args: {
    layout: 'stacked',
    columns: 3,
    items: [
      { term: 'Billed to', description: 'Harbour & Hale Ltd, 12 Quay Street, Bristol BS1 4DJ' },
      { term: 'Issued', description: '22 Sep 2026' },
      { term: 'Due', description: '22 Oct 2026' },
      { term: 'Amount', description: '£1,216.00' },
      { term: 'Status', description: <Tag label="Overdue" tone="danger" /> },
      { term: 'Reference', description: 'INV-2048' },
    ],
  },
}

/** Horizontal rows in two columns, for a longer record. */
export const TwoColumns: Story = {
  args: {
    layout: 'horizontal',
    columns: 2,
    items: [
      { term: 'Plan', description: 'Scale' },
      { term: 'Seats', description: '42 of 50' },
      { term: 'Monthly', description: '£1,216.00' },
      { term: 'Next invoice', description: '1 November 2026' },
      { term: 'Payment method', description: 'Visa ending 4417, expires 08/28' },
      { term: 'Region', description: 'England' },
    ],
  },
}

/** Inside a Card, the usual home for a details panel. */
export const InCard: Story = {
  args: { items: account, layout: 'horizontal', columns: 1 },
  decorators: [
    (Story) => (
      <div className="max-w-measure-md">
        <Card title="Account">
          <Story />
        </Card>
      </div>
    ),
  ],
}
