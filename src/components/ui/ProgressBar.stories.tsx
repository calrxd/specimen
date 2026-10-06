import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProgressBar } from './ProgressBar'

/**
 * Story arg names are the contract. `label` is the text property; `indeterminate` and
 * `showValue` are booleans; `value` is a number from 0 to 100, which Figma represents by
 * the drawn fill width rather than a property.
 */
const meta = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  argTypes: {
    label: { control: 'text', description: 'What is in progress. Also the accessible name.' },
    value: { control: { type: 'range', min: 0, max: 100 }, description: '0 to 100.' },
    indeterminate: { control: 'boolean', description: 'No known length; the bar pulses.' },
    showValue: { control: 'boolean', description: 'Percentage beside the label.' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Uploading invoices', value: 64, indeterminate: false, showValue: true },
}

export const Indeterminate: Story = {
  args: { label: 'Preparing your export', indeterminate: true },
}

export const Complete: Story = {
  args: { label: 'Import finished', value: 100, showValue: true },
}
