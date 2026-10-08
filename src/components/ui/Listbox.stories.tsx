import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Listbox } from './Listbox'

/**
 * Story arg names are the contract. `label` is required text; `hint`, `error` and `name` are
 * optional text with a `...Visible` boolean each (`name` has no drawing, so it is a hidden
 * text layer); `multiple` and `disabled` are booleans; `options` and `defaultValue` are
 * content, so the Figma component draws five options with one selected.
 */
const meta = {
  title: 'Components/Listbox',
  component: Listbox,
  argTypes: {
    label: { control: 'text', description: 'Always visible, above the list.' },
    multiple: { control: 'boolean', description: 'Allows more than one selected option.' },
    name: { control: 'text', description: 'Submits the selection with a form under this name.' },
    hint: { control: 'text', description: 'One line under the list. Hidden while an error shows.' },
    error: { control: 'text', description: 'Replaces the hint and turns the border danger.' },
    disabled: { control: 'boolean', description: 'Inert, and out of the tab order.' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Listbox>

export default meta
type Story = StoryObj<typeof meta>

const regions = [
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ie', label: 'Ireland' },
  { value: 'eu', label: 'European Union' },
  { value: 'us', label: 'United States' },
  { value: 'apac', label: 'Asia Pacific' },
]

const columns = [
  { value: 'customer', label: 'Customer' },
  { value: 'invoice', label: 'Invoice number' },
  { value: 'issued', label: 'Issue date' },
  { value: 'due', label: 'Due date' },
  { value: 'amount', label: 'Amount' },
  { value: 'status', label: 'Status' },
]

export const Default: Story = {
  args: { label: 'Data region', options: regions, defaultValue: ['uk'], multiple: false, disabled: false },
}

export const Multiple: Story = {
  args: {
    label: 'Columns to export',
    options: columns,
    defaultValue: ['customer', 'invoice', 'amount'],
    multiple: true,
    hint: 'Columns export in the order shown.',
  },
}

export const WithDisabledOption: Story = {
  args: {
    label: 'Data region',
    options: [...regions.slice(0, 3), { value: 'us', label: 'United States', disabled: true }, regions[4]],
    defaultValue: ['eu'],
    hint: 'United States hosting is on the Enterprise plan.',
  },
}

export const WithError: Story = {
  args: { label: 'Columns to export', options: columns, multiple: true, error: 'Choose at least one column.' },
}

export const Disabled: Story = {
  args: { label: 'Data region', options: regions, defaultValue: ['uk'], disabled: true, hint: 'Set when the workspace was created.' },
}
