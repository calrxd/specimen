import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Tag, type TagTone } from '@/components/ui/Tag'
import { DataTable, type DataTableColumn } from './DataTable'

type Invoice = { id: string; number: string; customer: string; status: 'Paid' | 'Due' | 'Overdue' | 'Draft'; issued: Date; amount: number }

const CUSTOMERS = ['Harbour & Hale', 'Northgate Studio', 'Pellow & Daughters', 'Arden Freight', 'Kestrel Labs', 'Moss Lane Dental', 'Fieldcraft Ltd', 'Quayside Bakery']
const STATUSES: Invoice['status'][] = ['Paid', 'Paid', 'Due', 'Overdue', 'Draft']
const TONE: Record<Invoice['status'], TagTone> = { Paid: 'success', Due: 'info', Overdue: 'danger', Draft: 'muted' }

/** Deterministic invoices, so stories and screenshots are stable between runs. */
function makeInvoices(count: number): Invoice[] {
  let seed = 7
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  return Array.from({ length: count }, (_, i) => ({
    id: `inv-${i + 1}`,
    number: `INV-${String(2048 + i).padStart(5, '0')}`,
    customer: CUSTOMERS[Math.floor(rand() * CUSTOMERS.length)],
    status: STATUSES[Math.floor(rand() * STATUSES.length)],
    issued: new Date(2026, 0, 1 + Math.floor(rand() * 270)),
    amount: Math.round(rand() * 480000) / 100 + 40,
  }))
}

const columns: DataTableColumn<Invoice>[] = [
  { key: 'number', header: 'Invoice', sortable: true, filterable: true, width: 140 },
  { key: 'customer', header: 'Customer', sortable: true, filterable: true, width: 200 },
  { key: 'status', header: 'Status', sortable: true, filterable: true, width: 120, render: (r) => <Tag label={r.status} tone={TONE[r.status]} /> },
  { key: 'issued', header: 'Issued', sortable: true, width: 140 },
  {
    key: 'amount',
    header: 'Amount',
    sortable: true,
    align: 'end',
    width: 140,
    render: (r) => r.amount.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' }),
  },
]

const fifty = makeInvoices(50)
const tenThousand = makeInvoices(10000)

/**
 * `columns` and `rows` are data. Sorting, filtering, paging and selection are held
 * inside the table; read them back with onSelectionChange.
 */
const meta = {
  title: 'Components/DataTable',
  component: DataTable<Invoice>,
  parameters: { layout: 'padded' },
  argTypes: {
    caption: { control: 'text', description: 'What the table holds. Also the grid name.' },
    density: { control: 'inline-radio', options: ['comfortable', 'compact'] },
    selectable: { control: 'boolean' },
    searchable: { control: 'boolean' },
    pageSize: { control: 'number' },
    height: { control: 'number' },
    columns: { control: false },
    rows: { control: false },
    getRowId: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="max-w-[56rem]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DataTable<Invoice>>

export default meta
type Story = StoryObj<typeof meta>

const base = { caption: 'Invoices issued in 2026', columns, getRowId: (r: Invoice) => r.id }

export const Default: Story = {
  args: { ...base, caption: 'Invoices issued in 2026, page by page', rows: fifty, pageSize: 10, searchable: true, selectable: true, density: 'comfortable' },
}

export const TenThousandRows: Story = {
  name: 'Ten thousand rows',
  args: { ...base, caption: 'Every invoice since 2019', rows: tenThousand, height: 480, searchable: true, selectable: true },
}

export const SortedByAmount: Story = {
  name: 'Sorted by amount',
  args: { ...base, caption: 'Invoices by amount', rows: fifty, pageSize: 10, defaultSort: { key: 'amount', direction: 'descending' } },
}

export const WithSelection: Story = {
  name: 'With selection',
  args: { ...base, caption: 'Invoices to approve', rows: fifty.slice(0, 8), selectable: true, defaultSelected: ['inv-2', 'inv-3', 'inv-6'] },
}

export const Compact: Story = {
  args: { ...base, caption: 'Invoices, compact rows', rows: fifty, pageSize: 15, density: 'compact' },
}

export const Empty: Story = {
  args: { ...base, caption: 'Invoices for Fieldcraft Ltd', rows: [], searchable: true, emptyMessage: 'No invoices yet. Create one from the billing page.' },
}
