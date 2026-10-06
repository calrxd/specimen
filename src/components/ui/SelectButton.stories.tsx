import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SelectButton } from './SelectButton'

/**
 * Story arg names are the contract. `label` is required text and `labelVisible` its
 * visibility; `size` is the variant axis; `disabled` is a boolean; `options` is content.
 */
const meta = {
  title: 'Components/SelectButton',
  component: SelectButton,
  argTypes: {
    label: { control: 'text', description: 'Names the choice.' },
    size: { control: 'inline-radio', options: ['md', 'sm'], description: 'md beside fields, sm in toolbars.' },
    labelVisible: { control: 'boolean', description: 'Shows the label above the control.' },
    disabled: { control: 'boolean', description: 'Inert.' },
  },
} satisfies Meta<typeof SelectButton>

export default meta
type Story = StoryObj<typeof meta>

const periods = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

export const Default: Story = {
  args: { label: 'Period', options: periods, defaultValue: 'week', size: 'md', labelVisible: false, disabled: false },
}

export const WithLabel: Story = {
  args: {
    label: 'Billing',
    labelVisible: true,
    defaultValue: 'yearly',
    options: [
      { value: 'monthly', label: 'Monthly' },
      { value: 'yearly', label: 'Yearly' },
    ],
  },
}

export const Small: Story = {
  args: { label: 'Density', size: 'sm', defaultValue: 'comfortable', options: [{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }] },
}

export const WithDisabledOption: Story = {
  args: {
    label: 'Plan',
    defaultValue: 'free',
    options: [
      { value: 'free', label: 'Free' },
      { value: 'pro', label: 'Pro' },
      { value: 'enterprise', label: 'Enterprise', disabled: true },
    ],
  },
}

export const Disabled: Story = {
  args: { label: 'Period', options: periods, defaultValue: 'day', disabled: true },
}
