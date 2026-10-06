import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Toast } from './Toast'

/**
 * Story arg names are the contract. `title` is the text property; `description` is
 * optional text with a `descriptionVisible` boolean; `tone` is the variant axis. The close
 * control appears in code when onDismiss is passed; Figma draws it on every variant.
 */
const meta = {
  title: 'Components/Toast',
  component: Toast,
  argTypes: {
    title: { control: 'text', description: 'What happened, past tense.' },
    description: { control: 'text', description: 'One line of detail. Omit to hide.' },
    tone: { control: 'inline-radio', options: ['info', 'success', 'warn', 'danger'], description: 'Status colour of the bar.' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { title: 'Token copied', description: '--color-sample-fill is on the clipboard.', tone: 'info', onDismiss: () => {} },
}

export const Success: Story = {
  args: { title: 'Release published', description: 'v0.1.0 is live on npm.', tone: 'success', onDismiss: () => {} },
}

export const Warn: Story = {
  args: { title: 'Figma check skipped', description: 'The API did not answer. The next scheduled run will retry.', tone: 'warn', onDismiss: () => {} },
}

export const Danger: Story = {
  args: { title: 'Drift found', description: 'Button.size has different values in Figma and in code.', tone: 'danger', onDismiss: () => {} },
}

export const TitleOnly: Story = {
  args: { title: 'Saved', tone: 'success' },
}
