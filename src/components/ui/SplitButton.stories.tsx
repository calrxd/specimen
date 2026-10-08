import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SplitButton } from './SplitButton'

/**
 * Story arg names are the contract. `label` is the text property; `variant` and `size` are
 * the variant axes; `disabled` is a boolean; `menuLabel` has no drawing, so it is a hidden
 * text layer; `items` is content, so the Figma set draws three. Click the arrow to open the menu.
 */
const meta = {
  title: 'Components/SplitButton',
  component: SplitButton,
  argTypes: {
    label: { control: 'text', description: 'The main action. Sentence case, starting with a verb.' },
    variant: { control: 'inline-radio', options: ['primary', 'secondary'], description: 'primary is the one green action per view.' },
    size: { control: 'inline-radio', options: ['md', 'sm'], description: 'md for forms and page actions, sm for table rows and toolbars.' },
    menuLabel: { control: 'text', description: 'Names the arrow for assistive technology.' },
    disabled: { control: 'boolean', description: 'Inert. Both halves go to the disabled outline.' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SplitButton>

export default meta
type Story = StoryObj<typeof meta>

const noop = () => {}

const invoiceActions = [
  { id: 'test', label: 'Send a test to me', onSelect: noop },
  { id: 'schedule', label: 'Schedule', onSelect: noop },
  { id: 'download', label: 'Download PDF', onSelect: noop },
]

export const Default: Story = {
  args: { label: 'Send invoice', items: invoiceActions, variant: 'primary', size: 'md', menuLabel: 'More actions', disabled: false },
}

export const Secondary: Story = {
  args: {
    label: 'Export CSV',
    variant: 'secondary',
    menuLabel: 'More export formats',
    items: [
      { id: 'xlsx', label: 'Export Excel', onSelect: noop },
      { id: 'json', label: 'Export JSON', onSelect: noop },
    ],
  },
}

export const Small: Story = {
  args: {
    label: 'Approve',
    size: 'sm',
    menuLabel: 'More review actions',
    items: [
      { id: 'changes', label: 'Request changes', onSelect: noop },
      { id: 'reassign', label: 'Reassign', onSelect: noop },
      { id: 'reject', label: 'Reject', onSelect: noop, tone: 'danger' },
    ],
  },
}

export const Disabled: Story = {
  args: { label: 'Send invoice', items: invoiceActions, disabled: true },
}
