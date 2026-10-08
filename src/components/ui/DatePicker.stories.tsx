import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DatePicker, type DatePreset } from './DatePicker'

const today = new Date(2026, 9, 6)
const daysAgo = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n)

const PRESETS: DatePreset[] = [
  { label: 'Last 7 days', value: { start: daysAgo(6), end: today } },
  { label: 'Last 30 days', value: { start: daysAgo(29), end: today } },
  { label: 'This month', value: { start: new Date(2026, 9, 1), end: new Date(2026, 9, 31) } },
  { label: 'Last quarter', value: { start: new Date(2026, 6, 1), end: new Date(2026, 8, 30) } },
]

/**
 * The value is held inside the picker; read it with onChange. Dates in stories are
 * fixed so screenshots do not change from day to day.
 */
const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: { layout: 'padded' },
  argTypes: {
    label: { control: 'text' },
    mode: { control: 'inline-radio', options: ['single', 'range'] },
    locale: { control: 'text' },
    weekStartsOn: { control: 'inline-radio', options: [1, 0] },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    presets: { control: false },
    defaultValue: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Due date', defaultValue: new Date(2026, 9, 31), hint: 'Reminders go out three days before.' },
}

export const Empty: Story = { args: { label: 'Due date', required: true } }

export const Range: Story = {
  args: { label: 'Report period', mode: 'range', defaultValue: { start: new Date(2026, 8, 1), end: new Date(2026, 8, 30) }, presets: PRESETS },
}

export const WithLimits: Story = {
  name: 'With limits',
  args: { label: 'Delivery date', defaultValue: new Date(2026, 9, 14), min: new Date(2026, 9, 8), max: new Date(2026, 10, 20), hint: 'Weekdays from 8 October.' },
}

export const OtherLocale: Story = {
  name: 'Other locale',
  args: { label: 'Rechnungsdatum', locale: 'de-DE', defaultValue: new Date(2026, 9, 6) },
}

export const WithError: Story = {
  name: 'With error',
  args: { label: 'Due date', required: true, error: 'Choose a due date before sending the invoice.' },
}

export const Disabled: Story = {
  args: { label: 'Due date', defaultValue: new Date(2026, 9, 31), disabled: true, hint: 'Set by the payment terms.' },
}
