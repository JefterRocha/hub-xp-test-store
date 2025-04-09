import { useState, useEffect, FormEvent, ChangeEvent, Fragment, SyntheticEvent } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
  SnackbarCloseReason
} from '@mui/material';
import axios from 'axios';

interface CategoryFormProps {
  categoryId?: string;
  onSubmit?: () => void;
}

export function CategoryForm({ categoryId, onSubmit }: CategoryFormProps) {
  const [category, setCategory] = useState<string>('');

  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoryId) {
      console.log(categoryId);
      
      axios.get(`http://localhost:3000/categories/${categoryId}`).then((response) => {
        const category = response.data;
        setCategory(category.name);
      });
    }
  }, [categoryId]);

  function handleAlertClose(
    _event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setCategory(value)
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = { name: category };

    try {
      if (categoryId) {
        await axios.put(`http://localhost:3000/categories/${categoryId}`, data);
      } else {
        await axios.post('http://localhost:3000/categories', data);
        setCategory('');
      }
      if (onSubmit) onSubmit();
      setAlertMessage('Categoria salva com sucesso!');
      setAlertSeverity('success');
      setOpenAlert(true);
    } catch (error) {
      setAlertMessage('Erro ao salvar a categoria.');
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
          {categoryId ? 'Editar Categoria' : 'Criar Categoria'}
        </Typography>

        <TextField
          label="Nome"
          name="name"
          value={category}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
          {categoryId ? 'Atualizar' : 'Criar'}
        </Button>
      </Box>
    </Fragment>

  );
};