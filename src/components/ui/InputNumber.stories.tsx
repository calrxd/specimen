import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { InputNumber } from './InputNumber'

/**
 * Story arg names are the contract. `label` is required text; `unit`, `hint` and `error` are
 * optional text with a `...Visible` boolean each; `required` and `disabled` are booleans.
 * `defaultValue`, `min`, `max` and `step` are numbers, which the contract carries as text.
 */
const meta = {
  title: 'Components/InputNumber',
  component: InputNumber,
  argTypes: {
    label: { control: 'text', description: 'Always visible, above the input.' },
    defaultValue: { control: 'number', description: 'The starting number.' },
    min: { control: 'number', description: 'Lowest accepted value.' },
    max: { control: 'number', description: 'Highest accepted value.' },
    step: { control: 'number', description: 'How far one step moves.' },
    unit: { control: 'text', description: 'Shown after the number. Omit to hide.' },
    hint: { control: 'text', description: 'One line under the input.' },
    error: { control: 'text', description: 'Replaces the hint and turns the border danger.' },
    required: { control: 'boolean', description: 'Green asterisk plus the native attribute.' },
    disabled: { control: 'boolean', description: 'Inert.' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputNumber>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Seats', defaultValue: 5, min: 1, max: 50, step: 1, required: false, disabled: false },
}

export const WithUnit: Story = {
  args: { label: 'Discount', defaultValue: 10, min: 0, max: 100, step: 5, unit: '%', hint: 'Applied to the first invoice only.' },
}

export const WithError: Story = {
  args: { label: 'Seats', defaultValue: 0, min: 1, error: 'A workspace needs at least one seat.', required: true },
}

export const Disabled: Story = {
  args: { label: 'Seats', defaultValue: 5, disabled: true, hint: 'Seats are set by your plan.' },
}
