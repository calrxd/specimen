import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { RichTextEditor } from './RichTextEditor'

const TEMPLATE = `<h2>Your September invoice</h2><p>Hi {first_name},</p><p>Your invoice for <strong>£1,240</strong> is attached and due on <em>3 October</em>. You can pay by card or bank transfer from the <a href="https://specimen.systems">customer portal</a>.</p><ul><li>Invoice INV-2048</li><li>Payment terms: 14 days</li></ul><p>Thanks,<br>The Harbour &amp; Hale team</p>`

const meta = {
  title: 'Components/RichTextEditor',
  component: RichTextEditor,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RichTextEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Comment', placeholder: 'Add a note for the team', hint: 'Paste from Word or a web page; only the formatting the editor supports is kept.' },
}

export const EmailTemplate: Story = {
  args: { label: 'Email template', defaultValue: TEMPLATE, rows: 10 },
}

export const WithError: Story = {
  args: { label: 'Release notes', required: true, error: 'Add release notes before publishing v0.2.0.', rows: 4 },
}

export const Disabled: Story = {
  args: { label: 'Email template', defaultValue: TEMPLATE, disabled: true, hint: 'Locked while the campaign is sending.' },
}
