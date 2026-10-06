import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Field } from './Field'

/**
 * Story arg names are the contract. `label` is the required text property; `placeholder`,
 * `hint` and `error` are optional text, so each gets a `...Visible` boolean in Figma;
 * `required`, `disabled` and `readOnly` become boolean properties.
 */
const meta = {
  title: 'Components/Field',
  component: Field,
  argTypes: {
    label: { control: 'text', description: 'Always visible, above the input.' },
    placeholder: { control: 'text', description: 'Inside the empty input, in faint.' },
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
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Email', placeholder: 'you@studio.com', required: false, disabled: false, readOnly: false },
}

export const WithHint: Story = {
  args: { label: 'Email', placeholder: 'you@studio.com', hint: 'One email at v1.0, one at the Figma kit drop.' },
}

export const Required: Story = {
  args: { label: 'Site name', placeholder: 'specimen', required: true },
}

export const WithError: Story = {
  args: { label: 'Email', placeholder: 'you@studio.com', hint: 'We never share it.', error: 'That does not look like an email address.' },
}

export const Disabled: Story = {
  args: { label: 'Catalogue number', placeholder: 'SPC-000', disabled: true },
}

export const ReadOnly: Story = {
  args: { label: 'Workspace ID', defaultValue: 'ws_7f3a9c21e04b', readOnly: true },
}
