import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Paginator } from './Paginator'

/**
 * Story arg names are the contract. `page` and `pageCount` are numbers; The accessible name is the native aria-label, so it has no Figma property. The story keeps its
 * own page state so the controls work.
 */
const meta = {
  title: 'Components/Paginator',
  component: Paginator,
  argTypes: {
    page: { control: { type: 'number', min: 1 }, description: 'Current page, from 1.' },
    pageCount: { control: { type: 'number', min: 1 }, description: 'Total pages.' },
  },
  render: function Render(args) {
    const [page, setPage] = useState(args.page)
    return <Paginator {...args} page={page} onPageChange={setPage} />
  },
} satisfies Meta<typeof Paginator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { page: 4, pageCount: 12 },
}

export const FirstPage: Story = {
  args: { page: 1, pageCount: 12 },
}

export const LastPage: Story = {
  args: { page: 12, pageCount: 12 },
}

export const FewPages: Story = {
  args: { page: 2, pageCount: 3 },
}
