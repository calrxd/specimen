import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AutoComplete, type AutoCompleteOption } from './AutoComplete'

const CUSTOMERS: AutoCompleteOption[] = [
  { value: 'hh', label: 'Harbour & Hale', description: 'London · 24 open invoices' },
  { value: 'hl', label: 'Hartley Logistics', description: 'Leeds · 3 open invoices' },
  { value: 'ns', label: 'Northgate Studio', description: 'Bristol · 9 open invoices' },
  { value: 'pd', label: 'Pellow & Daughters', description: 'Truro · no open invoices' },
  { value: 'af', label: 'Arden Freight', description: 'Coventry · 2 open invoices' },
  { value: 'kl', label: 'Kestrel Labs', description: 'Cambridge · 5 open invoices' },
  { value: 'ml', label: 'Moss Lane Dental', description: 'Manchester · on hold', disabled: true },
  { value: 'qb', label: 'Quayside Bakery', description: 'Cardiff · 1 open invoice' },
]

const STREETS = ['High Street', 'Station Road', 'Church Lane', 'Mill Road', 'Harbour Walk', 'Victoria Road', 'Park Avenue', 'Queens Road']

/** A pretend address lookup: 400ms away, like a real API. */
const searchAddresses = (query: string, signal: AbortSignal) =>
  new Promise<AutoCompleteOption[]>((resolve, reject) => {
    const t = setTimeout(() => {
      const q = query.toLowerCase()
      resolve(
        STREETS.flatMap((s, i) => [`${i + 1} ${s}, Bristol BS1 ${i + 1}AA`, `${i + 12} ${s}, Bath BA1 ${i + 2}QE`])
          .filter((a) => a.toLowerCase().includes(q))
          .slice(0, 6)
          .map((a) => ({ value: a, label: a })),
      )
    }, 400)
    signal.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })

/** `options` and `search` are data; the text and the chosen option are held inside. */
const meta = {
  title: 'Components/AutoComplete',
  component: AutoComplete,
  parameters: { layout: 'padded' },
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    minChars: { control: 'number' },
    hint: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    options: { control: false },
    search: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AutoComplete>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Customer', options: CUSTOMERS, placeholder: 'Start typing a name', hint: 'Customers you have invoiced before.' },
}

export const Chosen: Story = {
  args: { label: 'Customer', options: CUSTOMERS, defaultValue: 'Harbour & Hale' },
}

export const RemoteSearch: Story = {
  name: 'Remote search',
  args: { label: 'Billing address', search: searchAddresses, minChars: 2, placeholder: 'Start with a street name', hint: 'Addresses come from the postcode service.' },
}

export const WithError: Story = {
  name: 'With error',
  args: { label: 'Customer', options: CUSTOMERS, required: true, error: 'Choose a customer from the list.' },
}

export const Disabled: Story = {
  args: { label: 'Customer', options: CUSTOMERS, defaultValue: 'Harbour & Hale', disabled: true },
}
