import { useState, useEffect, Fragment, SyntheticEvent, ChangeEvent, FormEvent } from 'react';
import {
  TextField,
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

interface ProductFormProps {
  productId?: string;
  onSubmit?: () => void;
}

interface Category {
  _id: string;
  name: string;
}

export function ProductForm({ productId, onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryIds: [] as string[],
    image: null as File | null,
  });
  const [categories, setCategories] = useState<Category[]>([]);

  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:3000/categories').then((response) => {
      setCategories(response.data);
    });

    if (productId) {
      axios.get(`http://localhost:3000/products/${productId}`).then((response) => {
        const product = response.data;
        const categoryIds = product.categoryIds.map((category: { _id: string }) => category._id);

        setFormData({
          name: product.name,
          description: product.description || '',
          price: product.price,
          categoryIds,
          image: product.imageUrl || null,
        });

      });

    }
  }, [productId]);

  function handleAlertClose(
    _event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  function handleCategoryChange(e: any) {
    setFormData((prev) => ({
      ...prev,
      categoryIds: e.target.value as string[],
    }));
  };

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        image: e.target.files![0],
      }));
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price.toString());
    formData.categoryIds.forEach((id) => data.append('categoryIds[]', id));
    if (formData.image) {
      data.append('imageUrl', formData.image);
    }

    try {
      if (productId) {
        await axios.put(`http://localhost:3000/products/${productId}`, data);
      } else {
        await axios.post('http://localhost:3000/products', data);
      }
      if (onSubmit) onSubmit();
      setAlertMessage('Produto salvo com sucesso!');
      setAlertSeverity('success');
      setOpenAlert(true);
      setFormData({
        name: '',
        description: '',
        price: 0,
        categoryIds: [],
        image: null,
      });
    } catch (error) {
      setAlertMessage('Erro ao salvar produto!');
      setAlertSeverity('error');
      setOpenAlert(true);
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
          {productId ? 'Editar Produto' : 'Criar Produto'}
        </Typography>

        <TextField
          label="Nome"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <TextField
          label="Descrição"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />

        <TextField
          label="Preço"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Categorias</InputLabel>
          <Select
            multiple
            name="categoryIds"
            value={formData.categoryIds}

            onChange={handleCategoryChange}
            renderValue={(selected) =>
              selected.map((id) => categories.find((c) => c._id === id)?.name).join(', ')
            }
          >
            {categories.map((category) => (
              <MenuItem key={category._id} value={category._id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" component="label" fullWidth sx={{ mt: 2 }}>
          Upload de Imagem
          <input type="file" hidden onChange={handleFileChange} accept="image/*" />
        </Button>
        {formData.image && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Arquivo selecionado: {formData.image.name}
          </Typography>
        )}

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
          {productId ? 'Salvar' : 'Criar'}
        </Button>
      </Box>
    </Fragment>
  );
};