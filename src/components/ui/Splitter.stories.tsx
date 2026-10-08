import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Splitter } from './Splitter'

/** Drag the divider, or focus it and use the arrow keys. Enter collapses the first pane. */
const meta = {
  title: 'Components/Splitter',
  component: Splitter,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Splitter>

export default meta
type Story = StoryObj<typeof meta>

const invoices = ['INV-2048 · Harbour & Hale', 'INV-2047 · Northwind', 'INV-2046 · Lumen Studio', 'INV-2045 · Atlas Freight', 'INV-2044 · Kestrel Labs']

const List = () => (
  <ul className="m-0 flex list-none flex-col p-0">
    {invoices.map((inv, i) => (
      <li key={inv} className={['border-b border-line px-lg py-md text-caption', i === 0 ? 'bg-canvas text-ink' : 'text-muted'].join(' ')}>
        {inv}
      </li>
    ))}
  </ul>
)

const Detail = () => (
  <div className="flex flex-col gap-sm p-xl">
    <span className="text-body-lg text-ink">INV-2048</span>
    <p className="m-0 font-text text-body leading-relaxed text-muted">Harbour & Hale, £1,240, due on 3 October. The card on file was declined on the first attempt.</p>
  </div>
)

export const Default: Story = {
  args: { orientation: 'horizontal', label: 'Resize invoice list', defaultSize: 40, start: <List />, end: <Detail /> },
}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    label: 'Resize editor',
    defaultSize: 60,
    start: <Detail />,
    end: <div className="p-xl font-text text-caption text-muted">Activity: sent 1 Oct, viewed 2 Oct, payment failed 3 Oct.</div>,
  },
}

export const Narrow: Story = {
  args: { orientation: 'horizontal', label: 'Resize invoice list', defaultSize: 25, min: 15, max: 50, start: <List />, end: <Detail /> },
}
