import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Checkbox } from './Checkbox'

/**
 * Story arg names are the contract. `label` is the text property; `description` is
 * optional text with a `descriptionVisible` boolean; `checked` and `disabled` are booleans.
 */
const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  // `checked` sets defaultChecked, so a change from the controls panel would not
  // otherwise reach the rendered box. Remounting on the value keeps the control honest.
  render: (args) => <Checkbox key={String(args.checked)} {...args} />,
  argTypes: {
    label: { control: 'text', description: 'The text beside the box.' },
    description: { control: 'text', description: 'One line under the label. Omit to hide.' },
    checked: { control: 'boolean', description: 'Starts ticked.' },
    disabled: { control: 'boolean', description: 'Inert.' },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Also send me occasional updates about the system', checked: false, disabled: false },
}

export const Checked: Story = {
  args: { label: 'Publish on save', checked: true },
}

export const WithDescription: Story = {
  args: {
    label: 'Required to submit',
    description: 'The visitor cannot send the form until this is ticked.',
    checked: false,
  },
}

export const Disabled: Story = {
  args: { label: 'Ticked by default', description: 'Not valid consent under UK GDPR, so this stays off.', checked: false, disabled: true },
}

export const DisabledChecked: Story = {
  args: { label: 'System page', checked: true, disabled: true },
}
