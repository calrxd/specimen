import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TreeSelect, type TreeSelectNode } from './TreeSelect'

const TEAMS: TreeSelectNode[] = [
  {
    id: 'eng',
    label: 'Engineering',
    children: [
      { id: 'eng-platform', label: 'Platform', children: [{ id: 'eng-payments', label: 'Payments' }, { id: 'eng-identity', label: 'Identity' }] },
      { id: 'eng-product', label: 'Product engineering', children: [{ id: 'eng-web', label: 'Web' }, { id: 'eng-mobile', label: 'Mobile' }] },
    ],
  },
  {
    id: 'ops',
    label: 'Operations',
    children: [
      { id: 'ops-finance', label: 'Finance' },
      { id: 'ops-people', label: 'People' },
      { id: 'ops-legal', label: 'Legal', disabled: true },
    ],
  },
  { id: 'sales', label: 'Sales', children: [{ id: 'sales-uk', label: 'UK and Ireland' }, { id: 'sales-eu', label: 'Europe' }] },
]

const FOLDERS: TreeSelectNode[] = [
  {
    id: 'clients',
    label: 'Clients',
    children: [
      { id: 'hh', label: 'Harbour & Hale', children: [{ id: 'hh-2026', label: '2026 accounts' }, { id: 'hh-vat', label: 'VAT returns' }] },
      { id: 'np', label: 'Northpoint Ltd' },
    ],
  },
  { id: 'templates', label: 'Templates' },
]

const meta = {
  title: 'Components/TreeSelect',
  component: TreeSelect,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm pb-9xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TreeSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Team', nodes: TEAMS, placeholder: 'Choose a team', hint: 'The team that owns this cost centre.' },
}

export const WithValue: Story = {
  args: { label: 'Team', nodes: TEAMS, defaultValue: 'eng-payments', showPath: true },
}

export const AnyLevel: Story = {
  args: { label: 'Save to folder', nodes: FOLDERS, selectable: 'any', defaultValue: 'hh', hint: 'Any folder, including one that holds others.' },
}

export const WithError: Story = {
  args: { label: 'Team', nodes: TEAMS, placeholder: 'Choose a team', error: 'Choose the team that will approve this spend.', required: true },
}

export const Disabled: Story = {
  args: { label: 'Team', nodes: TEAMS, defaultValue: 'ops-finance', disabled: true },
}
