import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { InputGroup } from './InputGroup'

/**
 * Story arg names are the contract. `label` is required text; `placeholder`, `prefix`,
 * `suffix`, `hint` and `error` are optional text with a `...Visible` boolean each; `icon` is
 * an instance swap; `required`, `disabled` and `readOnly` are booleans.
 */
const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
  argTypes: {
    label: { control: 'text', description: 'Always visible, above the input.' },
    placeholder: { control: 'text', description: 'Inside the empty input, in faint.' },
    prefix: { control: 'text', description: 'Addon before the input. Omit to hide.' },
    suffix: { control: 'text', description: 'Addon after the input. Omit to hide.' },
    icon: { control: false, description: 'A 16px icon before the input. Decorative.' },
    hint: { control: 'text', description: 'One line under the input. Hidden while an error shows.' },
    error: { control: 'text', description: 'Replaces the hint and turns the border danger.' },
    required: { control: 'boolean', description: 'Green asterisk plus the native attribute.' },
    disabled: { control: 'boolean', description: 'Inert. Disabled border and text, no fill.' },
    readOnly: { control: 'boolean', description: 'Displayed, not editable. Decorative border.' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

const searchIcon = (
  <svg viewBox="0 0 16 16">
    <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10.5 10.5 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
)

export const Default: Story = {
  args: { label: 'Monthly price', placeholder: '0.00', prefix: '£', required: false, disabled: false, readOnly: false },
}

export const WithSuffix: Story = {
  args: { label: 'Annual discount', placeholder: '0', suffix: '%', inputMode: 'decimal', hint: 'Applied to every invoice on a yearly plan.' },
}

export const PrefixAndSuffix: Story = {
  args: { label: 'Seat price', placeholder: '0.00', prefix: '£', suffix: 'per seat', inputMode: 'decimal', required: true },
}

export const WithIcon: Story = {
  args: { label: 'Search customers', placeholder: 'Name, email or account ID', icon: searchIcon, type: 'search' },
}

export const WithError: Story = {
  args: { label: 'Parcel weight', placeholder: '0', suffix: 'kg', inputMode: 'decimal', error: 'Enter a weight under 30 kg.' },
}

export const Disabled: Story = {
  args: { label: 'Monthly price', defaultValue: '49.00', prefix: '£', disabled: true, hint: 'Set by your plan.' },
}

export const ReadOnly: Story = {
  args: { label: 'Workspace address', defaultValue: 'harbour-hale', prefix: 'https://', suffix: '.specimen.app', readOnly: true },
}
