import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'
import { ButtonGroup } from './ButtonGroup'
import { IconButton } from './IconButton'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'square' as const }

const alignLeft = (
  <svg viewBox="0 0 16 16">
    <path d="M2.5 4h11M2.5 8h7M2.5 12h9" {...stroke} />
  </svg>
)
const alignCentre = (
  <svg viewBox="0 0 16 16">
    <path d="M2.5 4h11M4.5 8h7M3.5 12h9" {...stroke} />
  </svg>
)
const alignRight = (
  <svg viewBox="0 0 16 16">
    <path d="M2.5 4h11M6.5 8h7M4.5 12h9" {...stroke} />
  </svg>
)
const prev = (
  <svg viewBox="0 0 16 16">
    <path d="M10 3 5 8l5 5" {...stroke} />
  </svg>
)
const next = (
  <svg viewBox="0 0 16 16">
    <path d="M6 3l5 5-5 5" {...stroke} />
  </svg>
)

/**
 * `children` is the content slot and `orientation` the Figma variant axis. The Figma set holds
 * three secondary Buttons, the common case.
 */
const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  argTypes: {
    label: { control: 'text', description: 'Names the group for assistive technology.' },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    children: { control: false },
  },
} satisfies Meta<typeof ButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

const views = (
  <>
    <Button label="Day" variant="secondary" />
    <Button label="Week" variant="secondary" />
    <Button label="Month" variant="secondary" />
  </>
)

export const Default: Story = {
  args: { label: 'Calendar view', orientation: 'horizontal', children: views },
}

export const Icons: Story = {
  args: {
    label: 'Text alignment',
    orientation: 'horizontal',
    children: (
      <>
        <IconButton label="Align left" icon={alignLeft} variant="secondary" />
        <IconButton label="Align centre" icon={alignCentre} variant="secondary" />
        <IconButton label="Align right" icon={alignRight} variant="secondary" />
      </>
    ),
  },
}

export const Pager: Story = {
  args: {
    label: 'Pages',
    orientation: 'horizontal',
    children: (
      <>
        <IconButton label="Previous page" icon={prev} variant="secondary" size="sm" />
        <Button label="Page 2 of 9" variant="secondary" size="sm" />
        <IconButton label="Next page" icon={next} variant="secondary" size="sm" />
      </>
    ),
  },
}

export const Vertical: Story = {
  args: {
    label: 'Export',
    orientation: 'vertical',
    children: (
      <>
        <Button label="Download CSV" variant="secondary" />
        <Button label="Download PDF" variant="secondary" />
        <Button label="Send by email" variant="secondary" />
      </>
    ),
  },
}
