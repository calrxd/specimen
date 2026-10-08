import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MeterGroup } from './MeterGroup'

/**
 * Story arg names are the contract. `label` and `unit` are text; `showValue` is a boolean;
 * `max` is a number and `items` content, so the Figma component draws three shares filling
 * about two thirds of the bar.
 */
const meta = {
  title: 'Components/MeterGroup',
  component: MeterGroup,
  argTypes: {
    label: { control: 'text', description: 'What is measured. Also the accessible name.' },
    max: { control: { type: 'number', min: 1 }, description: 'The quota the shares fill.' },
    unit: { control: 'text', description: 'Unit after every figure. Omit for a bare count.' },
    showValue: { control: 'boolean', description: 'Total used against max beside the label.' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MeterGroup>

export default meta
type Story = StoryObj<typeof meta>

const storage = [
  { id: 'documents', label: 'Documents', value: 24.1 },
  { id: 'images', label: 'Images', value: 18.6 },
  { id: 'exports', label: 'Exports', value: 9.3 },
]

export const Default: Story = {
  args: { label: 'Storage', items: storage, max: 100, unit: 'GB', showValue: true },
}

/** Seats on a Team plan, coloured by team rather than by order. */
export const Seats: Story = {
  args: {
    label: 'Seats',
    max: 50,
    unit: 'seats',
    items: [
      { id: 'finance', label: 'Finance', value: 12, tone: 'sample' },
      { id: 'operations', label: 'Operations', value: 17, tone: 'info' },
      { id: 'support', label: 'Support', value: 9, tone: 'muted' },
    ],
  },
}

/** Close to the limit: the warn share is the one to act on. */
export const NearlyFull: Story = {
  args: {
    label: 'Email sends this month',
    max: 10000,
    items: [
      { id: 'invoices', label: 'Invoices', value: 6420, tone: 'sample' },
      { id: 'reminders', label: 'Reminders', value: 2910, tone: 'warn' },
      { id: 'receipts', label: 'Receipts', value: 480, tone: 'info' },
    ],
  },
}

/** Over quota: the bar scales to the total and the figure turns danger. */
export const OverLimit: Story = {
  args: {
    label: 'Storage',
    max: 50,
    unit: 'GB',
    items: [
      { id: 'documents', label: 'Documents', value: 31.4 },
      { id: 'images', label: 'Images', value: 22.8 },
      { id: 'exports', label: 'Exports', value: 4.2 },
    ],
  },
}

export const WithoutValue: Story = {
  args: { label: 'Storage', items: storage, max: 100, unit: 'GB', showValue: false },
}
