import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'
import { Checkbox } from './Checkbox'
import { Popover } from './Popover'

/**
 * Story arg names are the contract. `label` is the text property; `side` and `align` are
 * variant axes; `trigger` is an instance swap (a Button by default) and `children` a slot.
 * The Figma component shows the open state. Click the trigger here to open it.
 */
const meta = {
  title: 'Components/Popover',
  component: Popover,
  argTypes: {
    label: { control: 'text', description: 'The heading, and the accessible name.' },
    side: { control: 'inline-radio', options: ['bottom', 'top'], description: 'Where it opens.' },
    align: { control: 'inline-radio', options: ['start', 'end'], description: 'Which trigger edge it lines up with.' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Filters',
    side: 'bottom',
    align: 'start',
    trigger: <Button label="Filter" variant="secondary" size="sm" />,
    children: (
      <div className="flex flex-col gap-md">
        <Checkbox label="Confirmed only" checked />
        <Checkbox label="Opted in to updates" />
      </div>
    ),
  },
}

export const Definition: Story = {
  args: {
    label: 'Interactive line',
    side: 'bottom',
    align: 'end',
    trigger: <Button label="What is this?" variant="ghost" size="sm" />,
    children: (
      <p className="m-0 text-caption leading-normal text-muted">
        The border of anything a user has to find and click. 3.29:1 on dark, 3.39:1 on light, which clears the 3:1 floor for a
        control boundary.
      </p>
    ),
  },
}
