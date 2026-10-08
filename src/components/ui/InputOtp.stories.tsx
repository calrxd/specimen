import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { InputOtp } from './InputOtp'

const meta = {
  title: 'Components/InputOtp',
  component: InputOtp,
  parameters: { layout: 'padded' },
  argTypes: {
    length: { control: { type: 'number', min: 4, max: 8 } },
    type: { control: 'inline-radio', options: ['numeric', 'alphanumeric'] },
  },
} satisfies Meta<typeof InputOtp>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Verification code', hint: 'We sent six digits to 07700 900123. They expire in ten minutes.' },
}

export const Filled: Story = {
  args: { label: 'Verification code', defaultValue: '482913' },
}

export const WithError: Story = {
  args: { label: 'Verification code', defaultValue: '482910', error: 'That code does not match. Check the latest message, or send a new code.', required: true },
}

export const Alphanumeric: Story = {
  args: { label: 'Recovery code', type: 'alphanumeric', length: 8, hint: 'Letters and numbers, from the recovery sheet you saved.' },
}

export const Masked: Story = {
  args: { label: 'Admin PIN', length: 4, masked: true, defaultValue: '73', hint: 'Four digits. Shown as dots once typed.' },
}

export const Disabled: Story = {
  args: { label: 'Verification code', disabled: true, hint: 'Send a new code to try again.' },
}
