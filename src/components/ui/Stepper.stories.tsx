import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Stepper } from './Stepper'

/**
 * Story arg names are the contract. `orientation` is the variant axis; `current` is a
 * number; `steps` is content, so the Figma set draws four steps with the second current.
 */
const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], description: 'Direction of the steps.' },
    current: { control: { type: 'number', min: 0 }, description: 'Index of the current step, from 0.' },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj<typeof meta>

const steps = [
  { id: 'account', label: 'Account', description: 'Name, email and password.' },
  { id: 'workspace', label: 'Workspace', description: 'Name the workspace and invite the team.' },
  { id: 'plan', label: 'Choose a plan', description: 'Free, Pro Developer or Pro Designer.' },
  { id: 'done', label: 'Done', description: 'Open the workspace.' },
]

export const Default: Story = {
  args: { steps, current: 1, orientation: 'horizontal' },
}

export const Vertical: Story = {
  args: { steps, current: 2, orientation: 'vertical' },
}

export const FirstStep: Story = {
  args: { steps, current: 0, orientation: 'horizontal' },
}

export const Complete: Story = {
  args: { steps, current: 4, orientation: 'horizontal' },
}
