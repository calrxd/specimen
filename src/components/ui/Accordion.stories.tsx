import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Accordion } from './Accordion'

/**
 * Story arg names are the contract. `items` is content, so the Figma component draws three
 * sections; `allowMultiple` is a boolean and `defaultOpen` optional text.
 */
const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  argTypes: {
    allowMultiple: { control: 'boolean', description: 'Several sections open at once.' },
    defaultOpen: { control: 'text', description: 'The id of the section open on load.' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

const items = [
  { id: 'licence', title: 'Which licence covers the free components?', content: 'MIT. Use them in any project, commercial or not.' },
  { id: 'figma', title: 'Is there a Figma file?', content: 'The basic kit is free. The full kit comes with a Pro Designer licence.' },
  { id: 'updates', title: 'How are updates delivered?', content: 'Through npm. Every release is listed in the changelog.' },
]

export const Default: Story = {
  args: { items, allowMultiple: false, defaultOpen: ['licence'] },
}

export const AllClosed: Story = {
  args: { items, allowMultiple: false },
}

export const AllowMultiple: Story = {
  args: { items, allowMultiple: true, defaultOpen: ['figma'] },
}

export const WithDisabled: Story = {
  args: {
    items: [...items.slice(0, 2), { id: 'archive', title: 'Archived questions', content: 'Nothing here yet.', disabled: true }],
    allowMultiple: false,
  },
}
