import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Stat } from './Stat'

/**
 * Story arg names are the contract. `label` and `value` are text; `change` and `caption` are
 * optional text with `...Visible` booleans; `direction`, `goodDirection`, `size` and
 * `variant` are variant axes. The colour of the change is worked out from direction and
 * goodDirection, so it has no property of its own.
 */
const meta = {
  title: 'Components/Stat',
  component: Stat,
  argTypes: {
    label: { control: 'text', description: 'What the figure measures.' },
    value: { control: 'text', description: 'The figure, formatted.' },
    change: { control: 'text', description: 'Movement against the previous period. Omit to hide.' },
    direction: { control: 'inline-radio', options: ['up', 'down', 'flat'], description: 'Which way it moved.' },
    goodDirection: { control: 'inline-radio', options: ['up', 'down'], description: 'Which way is good news.' },
    caption: { control: 'text', description: 'The comparison or context. Omit to hide.' },
    size: { control: 'inline-radio', options: ['md', 'lg'], description: 'lg for the figure a screen leads with.' },
    variant: { control: 'inline-radio', options: ['card', 'plain'], description: 'plain when a parent draws the frame.' },
  },
  parameters: { layout: 'padded' },
  // One Stat sits at card width; a story that sets `wide` lays out a row and takes the page.
  decorators: [(Story, { parameters }) => (parameters.wide ? <Story /> : <div className="max-w-measure-sm"><Story /></div>)],
} satisfies Meta<typeof Stat>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Monthly recurring revenue',
    value: '£84,210',
    change: '3.6%',
    direction: 'up',
    goodDirection: 'up',
    caption: 'Against September',
    size: 'md',
    variant: 'card',
  },
}

/** Fewer overdue invoices is good news, so down is success. */
export const DownIsGood: Story = {
  args: { label: 'Median time to live', value: '9 days', change: '3 days', direction: 'down', goodDirection: 'down', caption: 'Down from 12 days in September' },
}

/** More overdue invoices is bad news, so up is danger. */
export const UpIsBad: Story = {
  args: { label: 'Overdue', value: '£4,920', change: '2 invoices', direction: 'up', goodDirection: 'down', caption: '6 invoices, up from 4 last week' },
}

export const Flat: Story = {
  args: { label: 'Average revenue per seat', value: '£23.40', change: '0.0%', direction: 'flat', caption: 'Against September' },
}

/** A figure with no comparison, only context. */
export const NoChange: Story = {
  args: { label: 'Collected in October', value: '£21,480', caption: '26% of the month invoiced so far' },
}

/** The one figure a screen leads with. */
export const Large: Story = {
  args: { label: 'Net revenue retention', value: '112%', change: '3 points', direction: 'up', caption: 'Against last quarter', size: 'lg' },
}

/**
 * plain Stats in a strip: the grid gap shows the line colour behind canvas cells, so four
 * figures read as one measured object, the way the Pro dashboards draw them.
 */
export const Strip: Story = {
  args: { label: 'Monthly recurring revenue', value: '£84,210', variant: 'plain' },
  parameters: { wide: true },
  render: () => (
    <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
      <div className="bg-canvas p-xl">
        <Stat variant="plain" label="Monthly recurring revenue" value="£84,210" change="3.6%" direction="up" caption="Against September" />
      </div>
      <div className="bg-canvas p-xl">
        <Stat variant="plain" label="Collected in October" value="£21,480" caption="26% of the month invoiced so far" />
      </div>
      <div className="bg-canvas p-xl">
        <Stat variant="plain" label="Overdue" value="£4,920" change="2 invoices" direction="up" goodDirection="down" caption="6 invoices, up from 4 last week" />
      </div>
      <div className="bg-canvas p-xl">
        <Stat variant="plain" label="Failed payments" value="3" change="1" direction="up" goodDirection="down" caption="£1,240 to retry before 10 October" />
      </div>
    </div>
  ),
}
