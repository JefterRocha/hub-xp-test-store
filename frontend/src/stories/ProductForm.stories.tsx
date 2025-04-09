import { ProductForm } from '../components/ProductForm';

export default {
  title: 'Components/ProductForm',
  component: ProductForm,
};

export const Create = () => <ProductForm />;
export const Edit = () => <ProductForm productId="some-id" />;