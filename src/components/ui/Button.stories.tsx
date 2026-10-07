import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'
import { Field } from './Field'
import { SelectButton } from './SelectButton'

/**
 * Story arg names are the contract. `variant` and `size` become the Figma variant
 * axes; `disabled` becomes a boolean property on the set; `label` becomes the text
 * property. The Default story's args are the Figma defaults.
 */
const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    label: { control: 'text', description: 'The text on the button. Sentence case, starting with a verb.' },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'ghost', 'danger'],
      description: 'primary is the one green action per view. secondary is outlined. ghost is text only. danger is the destructive confirm.',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      description: 'md for forms and page actions, sm for table rows and toolbars.',
    },
    disabled: { control: 'boolean', description: 'Inert. Drops the fill and goes muted, whichever variant.' },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Notify me', variant: 'primary', size: 'md', disabled: false },
}

export const Secondary: Story = {
  args: { label: 'Save draft', variant: 'secondary', size: 'md', disabled: false },
}

export const Ghost: Story = {
  args: { label: 'Cancel', variant: 'ghost', size: 'md', disabled: false },
}

export const Danger: Story = {
  args: { label: 'Delete specimen', variant: 'danger', size: 'md', disabled: false },
}

export const Small: Story = {
  args: { label: 'Restore', variant: 'secondary', size: 'sm', disabled: false },
}

export const Disabled: Story = {
  args: { label: 'Publish', variant: 'primary', size: 'md', disabled: true },
}

/** Every variant beside every other, both sizes. The row a designer checks against Figma. */
export const Matrix: Story = {
  args: { label: 'Label', variant: 'primary', size: 'md', disabled: false },
  render: () => (
    <div className="flex flex-col gap-lg">
      {(['md', 'sm'] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-md">
          <Button label="Primary" variant="primary" size={size} />
          <Button label="Secondary" variant="secondary" size={size} />
          <Button label="Ghost" variant="ghost" size={size} />
          <Button label="Danger" variant="danger" size={size} />
          <Button label="Disabled" variant="primary" size={size} disabled />
        </div>
      ))}
    </div>
  ),
}

/** md controls share one height, so a field, a segmented control and a button sit level in a row. */
export const BesideAField: Story = {
  args: { label: 'Invite', variant: 'primary', size: 'md', disabled: false },
  render: (args) => (
    <div className="flex flex-wrap items-end gap-md">
      <div className="min-w-0 flex-1">
        <Field label="Email" placeholder="you@studio.com" />
      </div>
      <SelectButton
        label="Role"
        defaultValue="editor"
        options={[
          { value: 'viewer', label: 'Viewer' },
          { value: 'editor', label: 'Editor' },
        ]}
      />
      <Button {...args} />
    </div>
  ),
}
