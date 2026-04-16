import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Login from './pages/Login';
import SetupAdmin from './pages/SetupAdmin';
import Predictions from './pages/Predictions';
import { InventoryProvider, useInventory } from './context/InventoryContext';

// A simple wrapper to protect routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useInventory();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* All protected routes inside the Layout */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="billing" element={<Billing />} />
        <Route path="reports" element={<Reports />} />
        <Route path="predictions" element={<Predictions />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <InventoryProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </InventoryProvider>
  );
}

export default App;