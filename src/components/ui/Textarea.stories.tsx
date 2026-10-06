import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Textarea } from './Textarea'

/**
 * Story arg names are the contract. The same shape as Field: `label` is required text;
 * `placeholder`, `hint` and `error` are optional text with a `...Visible` boolean each;
 * `required`, `disabled` and `readOnly` are booleans.
 */
const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  argTypes: {
    label: { control: 'text', description: 'Always visible, above the box.' },
    placeholder: { control: 'text', description: 'Inside the empty box, in faint.' },
    hint: { control: 'text', description: 'One line under the box. Hidden while an error shows.' },
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
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Release notes', placeholder: 'What changed, and why', required: false, disabled: false, readOnly: false },
}

export const WithHint: Story = {
  args: { label: 'Release notes', placeholder: 'What changed, and why', hint: 'Markdown is rendered on the changelog page.' },
}

export const WithError: Story = {
  args: { label: 'Release notes', error: 'A release needs at least one line of notes.', required: true },
}

export const ReadOnly: Story = {
  args: {
    label: 'Published notes',
    defaultValue: 'Button gains a danger variant. Field reads its border from line-interactive.',
    readOnly: true,
  },
}

export const Disabled: Story = {
  args: { label: 'Release notes', placeholder: 'Locked while the release is building', disabled: true },
}
