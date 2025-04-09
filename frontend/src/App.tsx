import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';

import { ProductTable } from './components/ProductTable';
import { ProductForm } from './components/ProductForm';

import { CategoryForm } from './components/CategoryForm';
import { CategoryTable } from './components/CategoryTable';

import { OrderForm } from './components/OrderForm';
import { OrderTable } from './components/OrderTable';

import { Dashboard } from './components/Dashboard';

import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Store Hub XP
          </Typography>
          <Button color="inherit" component={Link} to="/products">
            Products
          </Button>
          <Button color="inherit" component={Link} to="/new-product">
            + Product
          </Button>
          <Button color="inherit" component={Link} to="/categories">
            Categories
          </Button>
          <Button color="inherit" component={Link} to="/new-category">
            + Category
          </Button>
          <Button color="inherit" component={Link} to="/orders">
            Orders
          </Button>
          <Button color="inherit" component={Link} to="/new-order">
            + Order
          </Button>
          <Button color="inherit" component={Link} to="/dashboard">
            Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Routes>
          <Route path="/products" element={<ProductTable />} />
          <Route path="/new-product" element={<ProductForm />} />
          <Route path="/product/:id" element={<ProductFormWrapper />} />

          <Route path="/categories" element={<CategoryTable />} />
          <Route path="/new-category" element={<CategoryForm />} />
          <Route path="/category/:id" element={<CategoryFormWrapper />} />

          <Route path="/orders" element={<OrderTable />} />
          <Route path="/new-order" element={<OrderForm />} />
          <Route path="/order/:id" element={<OrderFormWrapper />} />

          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Box>
    </Router>
  );
};

function ProductFormWrapper() {
  const { id } = useParams<{ id: string }>();
  return <ProductForm productId={id} />;
};

function CategoryFormWrapper() {
  const { id } = useParams<{ id: string }>();
  return <CategoryForm categoryId={id} />;
};

function OrderFormWrapper() {
  const { id } = useParams<{ id: string }>();
  return <OrderForm orderId={id} />;
};

export default App;