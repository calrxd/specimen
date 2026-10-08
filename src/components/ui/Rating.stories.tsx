import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Rating } from './Rating'

/**
 * `size` is the Figma variant axis; `labelVisible`, `readOnly` and `disabled` are booleans.
 * The value is a number, so Figma draws three of five stars filled.
 */
const meta = {
  title: 'Components/Rating',
  component: Rating,
  argTypes: {
    label: { control: 'text' },
    defaultValue: { control: { type: 'number', min: 0, max: 5 } },
    max: { control: { type: 'number', min: 3, max: 10 } },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
    labelVisible: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Rating>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Your rating', defaultValue: 3, size: 'md', labelVisible: true, readOnly: false, disabled: false },
}

export const Empty: Story = { args: { label: 'Rate this support reply' } }

export const ReadOnly: Story = {
  name: 'Read only',
  args: { label: 'Average rating', defaultValue: 4, readOnly: true },
}

export const Small: Story = {
  args: { label: 'Supplier quality', defaultValue: 4, size: 'sm', labelVisible: false },
}

export const TenPoint: Story = {
  name: 'Ten stars',
  args: { label: 'How likely are you to recommend us', defaultValue: 7, max: 10, size: 'sm' },
}

export const Disabled: Story = {
  args: { label: 'Your rating', defaultValue: 2, disabled: true },
}

/** A review list: read-only small ratings beside their text. */
export const InAList: Story = {
  name: 'In a list',
  args: { label: 'Rating', defaultValue: 5, size: 'sm', readOnly: true, labelVisible: false },
  render: () => (
    <ul className="m-0 flex max-w-measure-sm list-none flex-col gap-lg p-0">
      {[
        { who: 'Northwind Ltd', score: 5, text: 'Setup took an afternoon and the invoices matched our template.' },
        { who: 'Halden & Co', score: 3, text: 'Good once running. The import needed two tries.' },
      ].map((r) => (
        <li key={r.who} className="flex flex-col gap-xs border-b border-line pb-lg">
          <span className="font-mono text-body text-ink">{r.who}</span>
          <Rating label={`${r.who} rating`} defaultValue={r.score} size="sm" readOnly labelVisible={false} />
          <p className="m-0 font-text text-body text-muted">{r.text}</p>
        </li>
      ))}
    </ul>
  ),
}
