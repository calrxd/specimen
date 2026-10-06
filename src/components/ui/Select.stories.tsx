import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Select } from './Select'

const MODES = [
  { value: 'coming_soon', label: 'Coming soon' },
  { value: 'live', label: 'Live' },
  { value: 'maintenance', label: 'Maintenance' },
]

/**
 * Story arg names are the contract. `options` is a data prop with no Figma property;
 * the Figma component shows a representative value. Everything else mirrors Field.
 */
const meta = {
  title: 'Components/Select',
  component: Select,
  argTypes: {
    label: { control: 'text', description: 'Always visible, above the control.' },
    placeholder: { control: 'text', description: 'First, unselectable choice while nothing is chosen.' },
    hint: { control: 'text', description: 'One line under the control. Hidden while an error shows.' },
    error: { control: 'text', description: 'Replaces the hint and turns the border danger.' },
    required: { control: 'boolean', description: 'Green asterisk plus the native attribute.' },
    disabled: { control: 'boolean', description: 'Inert.' },
    options: { control: false, description: 'The choices. Content, not a Figma property.' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Site mode', options: MODES, placeholder: 'Choose a mode', required: false, disabled: false },
}

export const WithValue: Story = {
  args: { label: 'Site mode', options: MODES, defaultValue: 'coming_soon', hint: 'Flips the public page without a deploy.' },
}

export const Required: Story = {
  args: { label: 'Role', options: [{ value: 'owner', label: 'Owner' }, { value: 'editor', label: 'Editor' }], placeholder: 'Choose a role', required: true },
}

export const WithError: Story = {
  args: { label: 'Site mode', options: MODES, placeholder: 'Choose a mode', error: 'Pick a mode before publishing.' },
}

export const Disabled: Story = {
  args: { label: 'Catalogue', options: [{ value: 'spc', label: 'SPC-000' }], defaultValue: 'spc', disabled: true },
}
