import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SectionHeader } from './SectionHeader'

/**
 * Story arg names are the contract. Each arg below becomes a Figma component
 * property of the same name when this component is mirrored into the library.
 */
const meta = {
  title: 'Components/SectionHeader',
  component: SectionHeader,
  argTypes: {
    label: { control: 'text', description: 'Left-hand section title.' },
    meta: { control: 'text', description: 'Optional right-hand metadata. Omit to hide.' },
  },
} satisfies Meta<typeof SectionHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Components', meta: '12 total' },
}

export const WithoutMeta: Story = {
  args: { label: 'Foundations' },
}

export const LongLabel: Story = {
  args: { label: 'Accessibility and contrast requirements', meta: 'WCAG 2.2 AA' },
}
