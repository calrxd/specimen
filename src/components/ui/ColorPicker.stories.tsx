import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ColorPicker } from './ColorPicker'

const LABELS = ['#07753F', '#2CE98F', '#3E7BD6', '#D9A03F', '#C2453A', '#8B5CF6', '#565C57', '#0B0C0B']

const meta = {
  title: 'Components/ColorPicker',
  component: ColorPicker,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ColorPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Brand colour', defaultValue: '#07753F', hint: 'Used on buttons and links in your customer portal.' },
}

export const WithSwatches: Story = {
  args: { label: 'Label colour', defaultValue: '#3E7BD6', swatches: LABELS },
}

export const SwatchesOnly: Story = {
  args: { label: 'Project colour', defaultValue: '#D9A03F', swatches: LABELS, swatchesOnly: true },
}

export const WithError: Story = {
  args: {
    label: 'Brand colour',
    defaultValue: '#2CE98F',
    error: 'White text on this colour measures 1.6:1. Choose a darker shade for buttons.',
    required: true,
  },
}

export const Disabled: Story = {
  args: { label: 'Brand colour', defaultValue: '#07753F', swatches: LABELS, disabled: true, hint: 'Set by your organisation.' },
}
