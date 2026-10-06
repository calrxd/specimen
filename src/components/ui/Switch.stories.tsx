import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Switch } from './Switch'

/**
 * Story arg names are the contract. `label` is the text property; `description` is
 * optional text with a `descriptionVisible` boolean; `checked` and `disabled` are booleans.
 */
const meta = {
  title: 'Components/Switch',
  component: Switch,
  // `checked` sets defaultChecked, so remount on the value to keep the control honest.
  render: (args) => <Switch key={String(args.checked)} {...args} />,
  argTypes: {
    label: { control: 'text', description: 'The setting, not the action.' },
    description: { control: 'text', description: 'One line under the label. Omit to hide.' },
    checked: { control: 'boolean', description: 'Starts on.' },
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
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Publish on save', checked: false, disabled: false },
}

export const On: Story = {
  args: { label: 'Publish on save', checked: true },
}

export const WithDescription: Story = {
  args: { label: 'Signups open', description: 'The form on the home page accepts new addresses.', checked: true },
}

export const Disabled: Story = {
  args: { label: 'Maintenance mode', description: 'Set by the deploy, not here.', disabled: true },
}
