import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Switch } from './Switch'

/**
 * Story arg names are the contract. `label` is the text property; `description` is
 * optional text with a `descriptionVisible` boolean; `checked`, `labelVisible` and `disabled`
 * are booleans. `onChange` is behaviour, with no Figma property.
 */
const meta = {
  title: 'Components/Switch',
  component: Switch,
  argTypes: {
    label: { control: 'text', description: 'The setting, not the action.' },
    description: { control: 'text', description: 'One line under the label. Omit to hide.' },
    checked: { control: 'boolean', description: 'On or off. The switch follows it when it changes.' },
    labelVisible: { control: 'boolean', description: 'Draw the label. Off keeps it as the accessible name.' },
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
  args: { label: 'Publish on save', checked: false, labelVisible: true, disabled: false },
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

export const DisabledOn: Story = {
  args: { label: 'Audit log', description: 'Required on the Enterprise plan.', checked: true, disabled: true },
}

export const HiddenLabel: Story = {
  args: { label: 'Email me when an invoice is paid', labelVisible: false, checked: true },
}

/** A parent switch drives the rows: pausing turns every row off and disables it. */
export const PauseAll: Story = {
  args: { label: 'Pause all notifications' },
  render: function Render() {
    const [paused, setPaused] = useState(false)
    const rows = ['Invoice paid', 'Payment failed', 'New member joined']
    return (
      <div className="flex flex-col gap-xl">
        <Switch label="Pause all notifications" description="Every row turns off until you turn this back on." checked={paused} onChange={setPaused} />
        <div className="flex flex-col gap-lg border-t border-line pt-lg">
          {rows.map((r) => (
            <Switch key={r} label={r} checked={!paused} disabled={paused} />
          ))}
        </div>
      </div>
    )
  },
}
