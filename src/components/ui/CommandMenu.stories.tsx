import { useEffect, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'
import { CommandMenu } from './CommandMenu'

/**
 * Story arg names are the contract. `open` is a boolean; `placeholder` and `emptyText` are
 * optional text, each with a `...Visible` boolean; `groups` is content. In the story the
 * menu also opens with Ctrl+K or Cmd+K, which is how a product would wire it.
 */
const meta = {
  title: 'Components/CommandMenu',
  component: CommandMenu,
  argTypes: {
    open: { control: 'boolean', description: 'Showing or not.' },
    placeholder: { control: 'text', description: 'Inside the empty search field.' },
    emptyText: { control: 'text', description: 'When nothing matches.' },
  },
  parameters: { layout: 'fullscreen' },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open)
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          setOpen(true)
        }
      }
      document.addEventListener('keydown', onKey)
      return () => document.removeEventListener('keydown', onKey)
    }, [])
    return (
      <div className="p-2xl">
        <Button label="Open command menu" variant="secondary" onClick={() => setOpen(true)} />
        <CommandMenu {...args} open={open} onClose={() => setOpen(false)} />
      </div>
    )
  },
} satisfies Meta<typeof CommandMenu>

export default meta
type Story = StoryObj<typeof meta>

const noop = () => {}

const groups = [
  {
    label: 'Actions',
    commands: [
      { id: 'release', label: 'New release', hint: 'Ctrl+R', keywords: ['publish', 'version'], onSelect: noop },
      { id: 'copy', label: 'Copy token name', hint: 'Ctrl+C', onSelect: noop },
      { id: 'check', label: 'Run Figma check', keywords: ['drift'], onSelect: noop },
    ],
  },
  {
    label: 'Go to',
    commands: [
      { id: 'tokens', label: 'Tokens', hint: 'Foundations', onSelect: noop },
      { id: 'button', label: 'Button', hint: 'Components', onSelect: noop },
      { id: 'changelog', label: 'Changelog', onSelect: noop },
    ],
  },
]

export const Default: Story = {
  args: { open: true, groups, placeholder: 'Type a command', emptyText: 'No commands match. Try another word.', onClose: noop },
}

export const Empty: Story = {
  args: { open: true, groups: [], placeholder: 'Type a command', emptyText: 'No commands match. Try another word.', onClose: noop },
}
