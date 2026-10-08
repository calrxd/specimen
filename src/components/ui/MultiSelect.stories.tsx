import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MultiSelect, type MultiSelectOption } from './MultiSelect'

const COLUMNS: MultiSelectOption[] = [
  { value: 'number', label: 'Invoice number' },
  { value: 'customer', label: 'Customer' },
  { value: 'issued', label: 'Issue date' },
  { value: 'due', label: 'Due date' },
  { value: 'amount', label: 'Amount' },
  { value: 'vat', label: 'VAT' },
  { value: 'status', label: 'Status' },
]

const PEOPLE: MultiSelectOption[] = [
  { value: 'ada', label: 'Ada Lovelace', group: 'Finance', description: 'ada@harbourhale.co.uk' },
  { value: 'kat', label: 'Katherine Johnson', group: 'Finance', description: 'katherine@harbourhale.co.uk' },
  { value: 'mary', label: 'Mary Jackson', group: 'Finance', description: 'mary@harbourhale.co.uk', disabled: true },
  { value: 'grace', label: 'Grace Hopper', group: 'Product', description: 'grace@harbourhale.co.uk' },
  { value: 'alan', label: 'Alan Turing', group: 'Product', description: 'alan@harbourhale.co.uk' },
  { value: 'hedy', label: 'Hedy Lamarr', group: 'Marketing', description: 'hedy@harbourhale.co.uk' },
]

/** `options` is data; the chosen values are held inside and reported by onChange. */
const meta = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  parameters: { layout: 'padded' },
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    searchable: { control: 'boolean' },
    selectAll: { control: 'boolean' },
    maxShown: { control: 'number' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    options: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MultiSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Report columns', options: COLUMNS, defaultValue: ['number', 'customer', 'amount'], selectAll: true },
}

export const SearchAndGroups: Story = {
  name: 'Search and groups',
  args: { label: 'Send the report to', options: PEOPLE, searchable: true, selectAll: true, placeholder: 'Choose people', hint: 'Each person gets their own copy.' },
}

export const ManyChosen: Story = {
  name: 'Many chosen',
  args: { label: 'Report columns', options: COLUMNS, defaultValue: ['number', 'customer', 'issued', 'due', 'amount', 'vat'], maxShown: 2 },
}

export const WithError: Story = {
  name: 'With error',
  args: { label: 'Send the report to', options: PEOPLE, required: true, error: 'Choose at least one person.' },
}

export const Disabled: Story = {
  args: { label: 'Report columns', options: COLUMNS, defaultValue: ['number', 'amount'], disabled: true },
}
