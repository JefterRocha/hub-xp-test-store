import { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { ProductTable } from '../components/ProductTable';

// Configuração básica do Storybook
const meta: Meta<typeof ProductTable> = {
  title: 'Components/ProductTable',
  component: ProductTable,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ProductTable>;

export const Default: Story = {
  args: {
  },
};