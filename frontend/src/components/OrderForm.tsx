import { useState, useEffect, FormEvent, Fragment, SyntheticEvent } from 'react';
import {
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  SnackbarCloseReason,
} from '@mui/material';
import axios from 'axios';

interface OrderFormProps {
  orderId?: string;
  onSubmit?: () => void;
}

interface Products {
  _id: string;
  name: string;
  description: string;
  productIds: string[];
  imageUrl: string;
}

type formDataType = string[] | [];

export function OrderForm({ orderId, onSubmit }: OrderFormProps) {
  const [productIds, setProductsIds] = useState<formDataType>([]);
  const [products, setProducts] = useState<Products[]>([]);

  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    axios.get('http://localhost:3000/products').then((response) => {
      setProducts(response.data);
    });
  }, []);

  useEffect(() => {
    if (orderId) {
      axios.get(`http://localhost:3000/orders/${orderId}`).then((response) => {
        const order = response.data;
        console.log(order);
        
        setProductsIds(order.productIds.map((product: { _id: string }) => product._id));
      });
    }
  }, [orderId]);

  function handleProductsChange(e: any) {
    const value = e.target.value;

    setProductsIds(value);

  };

  function handleAlertClose(
    _event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (orderId) {
        await axios.put(`http://localhost:3000/orders/${orderId}`, { productIds });
      } else {
        await axios.post('http://localhost:3000/orders', { productIds });
      }
      if (onSubmit) onSubmit();
      setOpenAlert(true);
      setAlertMessage('Produto salvo com sucesso!');
      setAlertSeverity('success');
      setProductsIds([]);
    } catch (error) {
      setOpenAlert(true);
      setAlertMessage('Erro ao salvar o produto.');
      setAlertSeverity('error');
    }
    setLoading(false);
  };

  return (
    <Fragment>
      <Snackbar open={openAlert} autoHideDuration={4500} onClose={handleAlertClose}>
        <Alert
          onClose={handleAlertClose}
          severity={alertSeverity}
          variant='filled'
          sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: 'auto', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {orderId ? 'Editar Compra' : 'Criar Compra'}
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>Products</InputLabel>
          <Select
            multiple
            name="productsIds"
            value={productIds}
            onChange={handleProductsChange}
            renderValue={(selected) => selected.map((id) => products.find((product) => product._id === id)?.name).join(', ')}
          >
            {products.map((product) => (
              <MenuItem key={product._id} value={product._id}>
                {product.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
          {orderId ? 'Salvar' : 'Criar'}
        </Button>
      </Box>
    </Fragment>
  );
};