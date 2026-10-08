import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { InputMask } from './InputMask'

const meta = {
  title: 'Components/InputMask',
  component: InputMask,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputMask>

export default meta
type Story = StoryObj<typeof meta>

export const SortCode: Story = {
  args: { label: 'Sort code', mask: 'sort-code', hint: 'Six digits, on your bank card or statement.', required: true },
}

export const Phone: Story = {
  args: { label: 'Mobile number', mask: 'phone', defaultValue: '07700900123' },
}

export const Card: Story = {
  args: { label: 'Card number', mask: 'card', defaultValue: '4242424242424242', autoComplete: 'cc-number' },
}

export const VatNumber: Story = {
  args: { label: 'VAT number', mask: 'vat', defaultValue: '123456789', hint: 'GB followed by nine digits.' },
}

export const CustomPattern: Story = {
  args: { label: 'Company number', mask: 'aa999999', placeholder: 'SC123456', hint: 'Two letters and six digits, from Companies House.' },
}

export const WithError: Story = {
  args: { label: 'Sort code', mask: 'sort-code', defaultValue: '2000', error: 'A sort code has six digits.', required: true },
}

export const Disabled: Story = {
  args: { label: 'Sort code', mask: 'sort-code', defaultValue: '200000', disabled: true, hint: 'Contact your administrator to change bank details.' },
}
