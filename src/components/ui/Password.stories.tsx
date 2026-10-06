import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Password } from './Password'

/**
 * Story arg names are the contract. `label` is required text; `placeholder`, `hint` and
 * `error` are optional text with a `...Visible` boolean each; `required`, `disabled` and
 * `revealable` are booleans.
 */
const meta = {
  title: 'Components/Password',
  component: Password,
  argTypes: {
    label: { control: 'text', description: 'Always visible, above the input.' },
    placeholder: { control: 'text', description: 'Inside the empty input, in faint.' },
    hint: { control: 'text', description: 'The rules a new password must meet.' },
    error: { control: 'text', description: 'Replaces the hint and turns the border danger.' },
    required: { control: 'boolean', description: 'Green asterisk plus the native attribute.' },
    disabled: { control: 'boolean', description: 'Inert.' },
    revealable: { control: 'boolean', description: 'Shows the Show and Hide control.' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Password>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Password', placeholder: 'Your password', required: false, disabled: false, revealable: true },
}

export const NewPassword: Story = {
  args: {
    label: 'New password',
    hint: 'At least 12 characters. A passphrase of four words works well.',
    autoComplete: 'new-password',
    required: true,
  },
}

export const WithError: Story = {
  args: { label: 'Password', error: 'That password does not match this account.', required: true },
}

export const NotRevealable: Story = {
  args: { label: 'Admin PIN', placeholder: 'Six digits', revealable: false },
}

export const Disabled: Story = {
  args: { label: 'Password', placeholder: 'Managed by single sign-on', disabled: true },
}
