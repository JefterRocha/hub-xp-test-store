import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { BarChart, LineChart } from '@mui/x-charts';

interface Metrics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

interface PeriodData {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export const Dashboard = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [periodData, setPeriodData] = useState<PeriodData[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | ''>('');

  const [categories, setCategories] = useState<{ _id: string, name: string }[]>([]);
  const [products, setProducts] = useState<{ _id: string, name: string }[]>([]);

  const [category, setCategory] = useState<string>('');
  const [product, setProduct] = useState<string>('');

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await axios.get('http://localhost:3000/dashboard?');
        setMetrics(response.data);
      } catch (error) {
        console.error('Erro ao carregar métricas:', error);
      }
    };

    async function fetchCategories() {
      try {
        const response = await axios.get('http://localhost:3000/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Erro ao carregar métricas:', error);
      }
    };

    async function fetchProducts() {
      try {
        const response = await axios.get('http://localhost:3000/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Erro ao carregar métricas:', error);
      }
    };

    fetchMetrics();
    fetchCategories();
    fetchProducts();
  }, []);

  function parseCurrency(value: number) {
    const config: Intl.NumberFormatOptions = { style: 'currency', currency: 'BRL' };
    return new Intl.NumberFormat("pt-BR", config).format(value);
  }

  useEffect(() => {
    async function fetchPeriodData() {
      if (!period) {
        setPeriodData([]);
        return;
      }
      try {
        const response = await axios.get('http://localhost:3000/dashboard?', {
          params: { period },
        });
        setMetrics(response.data[0]);
        setPeriodData(response.data);

      } catch (error) {
        console.error('Erro ao carregar dados por período:', error);
      }
    };
    fetchPeriodData();
  }, [period]);
  useEffect(() => {
    async function fetchCategoryData() {
      if (!category) {
        setPeriodData([]);
        return;
      }
      try {
        const response = await axios.get('http://localhost:3000/dashboard?', {
          params: { categoryId: category },
        });

        setPeriodData(response.data);
        setMetrics(response.data);

      } catch (error) {
        console.error('Erro ao carregar dados por período:', error);
      }
    };
    fetchCategoryData();
  }, [category]);
  useEffect(() => {
    async function fetchProductData() {
      if (!product) {
        setPeriodData([]);
        return;
      }
      try {
        const response = await axios.get('http://localhost:3000/dashboard?', {
          params: { productId: product },
        });

        setPeriodData(response.data);
        setMetrics(response.data);

      } catch (error) {
        console.error('Erro ao carregar dados por período:', error);
      }
    };
    fetchProductData();
  }, [product]);

  if (!metrics) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Dashboard de KPIs
      </Typography>

      <FormControl sx={{ mb: 3, minWidth: 120 }}>
        <InputLabel>Categoria</InputLabel>
        <Select
          value={category}
          label="Categoria"
          onChange={(e) => setCategory(e.target.value)}
        >
          <MenuItem value="">Todos</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category._id} value={category._id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ mb: 3, minWidth: 120 }}>
        <InputLabel>Produto</InputLabel>
        <Select
          value={product}
          label="Produto"
          onChange={(e) => setProduct(e.target.value)}
        >
          <MenuItem value="">Todos</MenuItem>
          {products.map((product) => (
            <MenuItem key={product._id} value={product._id}>
              {product.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ mb: 3, minWidth: 120 }}>
        <InputLabel>Período</InputLabel>
        <Select
          value={period}
          label="Período"
          onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly' | '')}
        >
          <MenuItem value="">Total</MenuItem>
          <MenuItem value="daily">Diário</MenuItem>
          <MenuItem value="weekly">Semanal</MenuItem>
          <MenuItem value="monthly">Mensal</MenuItem>
        </Select>
      </FormControl>

      {/* Métricas Totais */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Total de Pedidos</Typography>
          <Typography variant="h4">{metrics.totalOrders}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Receita Total</Typography>
          <Typography variant="h4">{parseCurrency(metrics.totalRevenue)}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Valor Médio por Pedido</Typography>
          <Typography variant="h4">R$ {parseCurrency(metrics.averageOrderValue)}</Typography>
        </Paper>
      </Box>

      {/* Gráficos por Período */}
      {period && periodData.length > 0 && (
        <>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pedidos por {period === 'daily' ? 'Dia' : period === 'weekly' ? 'Semana' : 'Mês'}
            </Typography>
            <BarChart
              xAxis={[{ scaleType: 'band', data: periodData.map((d) => d.date) }]}
              series={[{ data: periodData.map((d) => d.totalOrders), label: 'Pedidos' }]}
              width={600}
              height={300}
            />
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Receita por {period === 'daily' ? 'Dia' : period === 'weekly' ? 'Semana' : 'Mês'}
            </Typography>
            <LineChart
              dataset={[...periodData.map((d) => ({ date: new Date(d.date) }))]}
              xAxis={[{
                id: 'Years',
                dataKey: 'date',
                scaleType: 'time',
                valueFormatter: (date) => date.toLocaleDateString(),
              },]}
              series={[{ data: periodData.map((d) => d.totalRevenue), label: 'Receita (R$)' }]}
              width={600}
              height={300}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};