import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'
import { Card } from './Card'

/**
 * Story arg names are the contract. `title` and `description` are optional text, each with
 * a `...Visible` boolean in Figma; `titleSize` is the variant axis; `children` is a slot and
 * `actions` an instance swap. `headingLevel` is a number, so it has no Figma property.
 */
const meta = {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    title: { control: 'text', description: 'The heading. Omit to hide.' },
    titleSize: { control: 'inline-radio', options: ['md', 'lg'], description: 'lg when the title is a figure.' },
    headingLevel: { control: 'inline-radio', options: [2, 3, 4], description: 'Where the card sits in the page outline.' },
    description: { control: 'text', description: 'What the card holds. Omit to hide.' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Monthly report',
    titleSize: 'md',
    headingLevel: 3,
    description: 'Revenue, signups and churn for September, sent to the team on the first working day.',
    children: <p className="m-0 font-mono text-display text-ink">£84,210</p>,
    actions: <Button label="Open report" variant="secondary" size="sm" />,
  },
}

export const TitleOnly: Story = {
  args: {
    title: 'Notifications',
    children: <p className="m-0 font-text text-body text-muted">You are up to date.</p>,
  },
}

export const WithActions: Story = {
  args: {
    title: 'Delete workspace',
    description: 'Every project, member and invoice in this workspace is removed. This cannot be undone.',
    actions: (
      <>
        <Button label="Cancel" variant="secondary" size="sm" />
        <Button label="Delete workspace" variant="danger" size="sm" />
      </>
    ),
  },
}

export const Bare: Story = {
  args: {
    children: <p className="m-0 font-text text-body text-muted">A card with no heading frames any content.</p>,
  },
}

/** The title is the figure: a plan price, with what it buys underneath. */
export const Price: Story = {
  args: {
    title: '£249 a year',
    titleSize: 'lg',
    description: 'Pro Bundle for one person. Renews on 12 March 2027.',
    actions: <Button label="Change plan" variant="secondary" size="sm" />,
  },
}

/** A card directly under the page title is a top-level section, so its heading is an h2. */
export const SectionHeading: Story = {
  args: {
    title: 'Payment method',
    headingLevel: 2,
    description: 'Visa ending 4242, expires 08/28.',
    actions: <Button label="Update card" variant="secondary" size="sm" />,
  },
}
