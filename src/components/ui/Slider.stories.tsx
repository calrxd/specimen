import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Slider } from './Slider'

/**
 * Story arg names are the contract. `label` is required text; `unit` is optional text with a
 * `unitVisible` boolean; `showValue` and `disabled` are booleans. `defaultValue`, `min`, `max`
 * and `step` are numbers, which the contract carries as text.
 */
const meta = {
  title: 'Components/Slider',
  component: Slider,
  argTypes: {
    label: { control: 'text', description: 'Always visible, above the track.' },
    defaultValue: { control: 'number', description: 'Starting value.' },
    min: { control: 'number', description: 'Left end of the track.' },
    max: { control: 'number', description: 'Right end of the track.' },
    step: { control: 'number', description: 'Smallest move.' },
    unit: { control: 'text', description: 'Shown after the value. Omit to hide.' },
    showValue: { control: 'boolean', description: 'Shows the current value.' },
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
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Storage limit', defaultValue: 40, min: 10, max: 100, step: 10, unit: 'GB', showValue: true, disabled: false },
}

export const Percentage: Story = {
  args: { label: 'Sampling rate', defaultValue: 25, min: 0, max: 100, step: 5, unit: '%' },
}

export const WithoutValue: Story = {
  args: { label: 'Density', defaultValue: 50, showValue: false },
}

export const Disabled: Story = {
  args: { label: 'Retention', defaultValue: 30, min: 7, max: 90, unit: 'days', disabled: true },
}
