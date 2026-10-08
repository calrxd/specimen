import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DatePicker } from './DatePicker'
import { TimePicker } from './TimePicker'

/**
 * The value is held inside the picker as 24-hour "HH:MM"; read it with onChange. `format`
 * is the Figma variant axis; the optional strings carry a visibility boolean each.
 */
const meta = {
  title: 'Components/TimePicker',
  component: TimePicker,
  parameters: { layout: 'padded' },
  argTypes: {
    label: { control: 'text' },
    defaultValue: { control: 'text', description: '24-hour "HH:MM".' },
    step: { control: 'inline-radio', options: [5, 15, 30, 60] },
    min: { control: 'text' },
    max: { control: 'text' },
    format: { control: 'inline-radio', options: ['24h', '12h'] },
    placeholder: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TimePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Start time', defaultValue: '09:30', format: '24h', hint: 'Shown in your time zone, London.' },
}

export const Empty: Story = { args: { label: 'Start time', required: true } }

export const TwelveHour: Story = {
  name: '12-hour',
  args: { label: 'Pickup time', defaultValue: '14:30', format: '12h', step: 30 },
}

export const OpeningHours: Story = {
  name: 'Opening hours',
  args: { label: 'Booking slot', min: '08:00', max: '18:00', step: 30, hint: 'Bookings from 8:00 to 18:00.' },
}

export const WithError: Story = {
  name: 'With error',
  args: { label: 'End time', defaultValue: '08:45', error: 'Choose an end time after the start time.' },
}

export const Disabled: Story = {
  args: { label: 'Start time', defaultValue: '09:00', disabled: true, hint: 'Set by the meeting room.' },
}

/** With DatePicker: the two share one height and one frame, so a date and time sit as a pair. */
export const WithADate: Story = {
  name: 'With a date',
  args: { label: 'Time', defaultValue: '10:00' },
  render: (args) => (
    <div className="flex flex-wrap gap-md">
      <div className="min-w-0 flex-1">
        <DatePicker label="Date" defaultValue={new Date(2026, 9, 14)} />
      </div>
      <div className="min-w-0 flex-1">
        <TimePicker {...args} />
      </div>
    </div>
  ),
}
