import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Radio } from './Radio'

/**
 * Story arg names are the contract. `label` is the text property; `description` is
 * optional text with a `descriptionVisible` boolean; `checked` and `disabled` are booleans.
 */
const meta = {
  title: 'Components/Radio',
  component: Radio,
  // `checked` sets defaultChecked, so remount on the value to keep the control honest.
  render: (args) => <Radio key={String(args.checked)} {...args} />,
  argTypes: {
    label: { control: 'text', description: 'The text beside the circle.' },
    description: { control: 'text', description: 'One line under the label. Omit to hide.' },
    checked: { control: 'boolean', description: 'Starts selected.' },
    disabled: { control: 'boolean', description: 'Inert.' },
  },
} satisfies Meta<typeof Radio>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Monthly', checked: false, disabled: false },
}

export const Checked: Story = {
  args: { label: 'Yearly', checked: true },
}

export const WithDescription: Story = {
  args: { label: 'Team', description: 'Up to twenty seats, billed to one card.', checked: false },
}

export const Disabled: Story = {
  args: { label: 'Enterprise', description: 'Talk to us first.', disabled: true },
}

/** How a set is built: a fieldset, a legend that asks the question, one shared name. */
export const Group: Story = {
  args: { label: 'Monthly' },
  render: () => (
    <fieldset className="m-0 flex flex-col gap-lg border-0 p-0">
      <legend className="mb-md text-label uppercase text-muted tracking-label">Billing</legend>
      <Radio name="billing" value="monthly" label="Monthly" checked />
      <Radio name="billing" value="yearly" label="Yearly" description="Two months free." />
      <Radio name="billing" value="enterprise" label="Enterprise" description="Talk to us first." disabled />
    </fieldset>
  ),
}
