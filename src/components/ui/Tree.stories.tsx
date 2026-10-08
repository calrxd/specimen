import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Tree, type TreeNode } from './Tree'

const FOLDERS: TreeNode[] = [
  {
    id: 'clients',
    label: 'Clients',
    meta: '3',
    children: [
      {
        id: 'harbour',
        label: 'Harbour & Hale',
        meta: '24 files',
        children: [
          { id: 'harbour-contracts', label: 'Contracts', meta: '6 files' },
          { id: 'harbour-invoices', label: 'Invoices', meta: '14 files' },
          { id: 'harbour-brand', label: 'Brand assets', meta: '4 files' },
        ],
      },
      { id: 'northgate', label: 'Northgate Studio', meta: '9 files', children: [{ id: 'northgate-invoices', label: 'Invoices', meta: '9 files' }] },
      { id: 'kestrel', label: 'Kestrel Labs', meta: '2 files' },
    ],
  },
  { id: 'templates', label: 'Templates', meta: '5', children: [{ id: 'tpl-invoice', label: 'Invoice' }, { id: 'tpl-reminder', label: 'Payment reminder' }] },
  { id: 'archive', label: 'Archive', meta: 'Read only', disabled: true },
]

const PERMISSIONS: TreeNode[] = [
  {
    id: 'billing',
    label: 'Billing',
    children: [
      { id: 'billing-view', label: 'View invoices' },
      { id: 'billing-create', label: 'Create invoices' },
      { id: 'billing-refund', label: 'Issue refunds' },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    children: [
      { id: 'team-invite', label: 'Invite members' },
      { id: 'team-remove', label: 'Remove members' },
    ],
  },
  { id: 'settings', label: 'Workspace settings' },
]

/**
 * `nodes` is data. Expansion, selection and order are held inside the tree;
 * read them back with onSelectionChange and onReorder.
 */
const meta = {
  title: 'Components/Tree',
  component: Tree,
  parameters: { layout: 'padded' },
  argTypes: {
    label: { control: 'text', description: 'Accessible name of the tree.' },
    selection: { control: 'inline-radio', options: ['none', 'single', 'multiple'] },
    reorderable: { control: 'boolean' },
    nodes: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tree>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Workspace folders', nodes: FOLDERS, selection: 'single', defaultExpanded: ['clients', 'harbour'], defaultSelected: ['harbour-invoices'] },
}

export const MultipleSelection: Story = {
  name: 'Multiple selection',
  args: { label: 'Permissions for editors', nodes: PERMISSIONS, selection: 'multiple', defaultExpanded: ['billing', 'team'], defaultSelected: ['billing-view', 'billing-create'] },
}

export const Reorderable: Story = {
  args: { label: 'Templates', nodes: FOLDERS, selection: 'single', reorderable: true, defaultExpanded: ['clients', 'templates'] },
}

export const NavigationOnly: Story = {
  name: 'Navigation only',
  args: { label: 'Workspace folders', nodes: FOLDERS, selection: 'none' },
}
