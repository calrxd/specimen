import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Field } from './Field'
import { Fieldset } from './Fieldset'
import { Select } from './Select'

/**
 * Story arg names are the contract. `legend` is required text; `description` is optional
 * text with a `descriptionVisible` boolean; `disabled` is a boolean; `children` is a slot
 * that takes the fields.
 */
const meta = {
  title: 'Components/Fieldset',
  component: Fieldset,
  argTypes: {
    legend: { control: 'text', description: 'Names the group, above its fields.' },
    description: { control: 'text', description: 'Explains the group. Omit to hide.' },
    disabled: { control: 'boolean', description: 'Disables every control inside.' },
    children: { control: false, description: 'The fields in the group.' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Fieldset>

export default meta
type Story = StoryObj<typeof meta>

const address = (
  <>
    <Field label="Address line 1" autoComplete="address-line1" required />
    <Field label="Town or city" autoComplete="address-level2" required />
    <Field label="Postcode" autoComplete="postal-code" required />
  </>
)

export const Default: Story = {
  args: { legend: 'Billing address', disabled: false, children: address },
}

export const WithDescription: Story = {
  args: {
    legend: 'Billing address',
    description: 'Printed on every invoice. Use the address registered with Companies House.',
    disabled: false,
    children: address,
  },
}

export const Disabled: Story = {
  args: {
    legend: 'Single sign-on',
    description: 'Managed by your identity provider. Ask an owner to change it.',
    disabled: true,
    children: (
      <>
        <Field label="Entity ID" defaultValue="https://idp.harbourhale.co.uk/saml" />
        <Field label="Sign-in URL" defaultValue="https://idp.harbourhale.co.uk/sso" />
        <Select
          label="Default role"
          defaultValue="member"
          options={[
            { value: 'member', label: 'Member' },
            { value: 'admin', label: 'Admin' },
          ]}
        />
      </>
    ),
  },
}
