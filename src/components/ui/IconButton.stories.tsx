import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'
import { Field } from './Field'
import { IconButton } from './IconButton'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'square' as const }

const edit = (
  <svg viewBox="0 0 16 16">
    <path d="M10.5 2.5 13.5 5.5 6 13H3v-3z" {...stroke} />
  </svg>
)
const copy = (
  <svg viewBox="0 0 16 16">
    <path d="M5.5 5.5h8v8h-8zM10.5 5.5v-3h-8v8h3" {...stroke} />
  </svg>
)
const more = (
  <svg viewBox="0 0 16 16">
    <path d="M3 8h1M7.5 8h1M12 8h1" {...stroke} strokeWidth={2} />
  </svg>
)
const trash = (
  <svg viewBox="0 0 16 16">
    <path d="M2.5 4.5h11M6 4.5v-2h4v2M4 4.5l.75 9h6.5l.75-9" {...stroke} />
  </svg>
)
const plus = (
  <svg viewBox="0 0 16 16">
    <path d="M8 3v10M3 8h10" {...stroke} />
  </svg>
)
const pin = (
  <svg viewBox="0 0 16 16">
    <path d="M6 2.5h4v4l2 2.5H4l2-2.5zM8 9v4.5" {...stroke} />
  </svg>
)

/**
 * Story arg names are the contract. `variant` and `size` become the Figma variant axes;
 * `pressed` and `disabled` become booleans; `label` is the text property, which Figma shows
 * as the tooltip; `icon` is an instance swap onto the Icon/ components.
 */
const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  argTypes: {
    label: { control: 'text', description: 'The accessible name and tooltip. A verb: "Edit customer".' },
    icon: { control: false, description: 'A 16px stroke icon in currentColor.' },
    variant: { control: 'inline-radio', options: ['ghost', 'secondary', 'primary', 'danger'] },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    pressed: { control: 'boolean', description: 'For a toggle: true while it is on.' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Edit customer', icon: edit, variant: 'ghost', size: 'md', disabled: false },
}

export const Secondary: Story = {
  args: { label: 'Copy link', icon: copy, variant: 'secondary', size: 'md', disabled: false },
}

export const Primary: Story = {
  args: { label: 'Add customer', icon: plus, variant: 'primary', size: 'md', disabled: false },
}

export const Danger: Story = {
  args: { label: 'Delete invoice', icon: trash, variant: 'danger', size: 'md', disabled: false },
}

export const Small: Story = {
  args: { label: 'More actions', icon: more, variant: 'ghost', size: 'sm', disabled: false },
}

export const Pressed: Story = {
  args: { label: 'Pin row', icon: pin, variant: 'ghost', size: 'md', pressed: true, disabled: false },
}

export const Disabled: Story = {
  args: { label: 'Edit customer', icon: edit, variant: 'secondary', size: 'md', disabled: true },
}

/** Every variant at both sizes. The row a designer checks against Figma. */
export const Matrix: Story = {
  args: { label: 'Edit', icon: edit },
  render: () => (
    <div className="flex flex-col gap-lg">
      {(['md', 'sm'] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-md">
          <IconButton label="Edit" icon={edit} variant="ghost" size={size} />
          <IconButton label="Copy" icon={copy} variant="secondary" size={size} />
          <IconButton label="Add" icon={plus} variant="primary" size={size} />
          <IconButton label="Delete" icon={trash} variant="danger" size={size} />
          <IconButton label="Pin" icon={pin} size={size} pressed />
          <IconButton label="More" icon={more} variant="secondary" size={size} disabled />
        </div>
      ))}
    </div>
  ),
}

/** md shares Field and Button's height, so a search row lines up. */
export const BesideAField: Story = {
  name: 'Beside a field',
  args: { label: 'Copy link', icon: copy, variant: 'secondary', size: 'md' },
  render: (args) => (
    <div className="flex flex-wrap items-end gap-md">
      <div className="min-w-0 flex-1">
        <Field label="Share link" defaultValue="specimen.systems/s/7Q4M" readOnly />
      </div>
      <IconButton {...args} />
      <Button label="Send" />
    </div>
  ),
}
