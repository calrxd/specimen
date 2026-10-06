import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Tabs } from './Tabs'

/**
 * Story arg names are the contract. `items` is content, so the Figma component has no
 * properties: it draws three tabs with the first selected, which is what the code renders
 * on load.
 */
const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    'aria-label': 'Component',
    items: [
      { id: 'usage', label: 'Usage', content: 'One primary button per view. Sentence case, starting with a verb.' },
      { id: 'props', label: 'Props', content: 'Four props: variant, size, disabled and label.' },
      { id: 'tokens', label: 'Tokens', content: 'Reads sample-fill, on-sample, line-interactive and disabled.' },
    ],
  },
}

export const WithDisabled: Story = {
  args: {
    'aria-label': 'Release',
    items: [
      { id: 'notes', label: 'Notes', content: 'Button gains a danger variant.' },
      { id: 'diff', label: 'Diff', content: 'Three files changed.' },
      { id: 'publish', label: 'Publish', content: 'Waiting on review.', disabled: true },
    ],
  },
}
