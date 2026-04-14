import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const InventoryContext = createContext();
export const useInventory = () => useContext(InventoryContext);

const API_URL = 'http://localhost:5000/api';

export const InventoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]); // <-- Added Orders state
  const [isAuthenticated, setIsAuthenticated] = useState(false); // <-- Added Auth state

  // FETCH DATA ON LOAD
  useEffect(() => {
    const fetchDatabase = async () => {
      try {
        const [catRes, prodRes, orderRes] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/orders`) // Fetch the invoices!
        ]);
        
        setCategories(catRes.data.map(c => ({ ...c, id: c._id })));
        setProducts(prodRes.data.map(p => ({ ...p, id: p._id })));
        setOrders(orderRes.data.map(o => ({ ...o, id: o._id })));
      } catch (error) {
        console.error("Database connection error:", error);
      }
    };
    
    if (isAuthenticated) {
      fetchDatabase(); // Only fetch if logged in
    }
  }, [isAuthenticated]);

  // --- AUTH FUNCTIONS ---
  const login = async (username, password) => {
    try {
      await axios.post(`${API_URL}/auth/login`, { username, password });
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      return false;
    }
  };

  const logout = () => setIsAuthenticated(false);

  // --- PRODUCT & CATEGORY FUNCTIONS ---
  const addProduct = async (product) => {
    try {
      const res = await axios.post(`${API_URL}/products`, product);
      setProducts(prev => [{ ...res.data, id: res.data._id }, ...prev]);
    } catch (err) { console.error(err); }
  };
  
  const editProduct = async (id, updatedData) => {
    try {
      const res = await axios.put(`${API_URL}/products/${id}`, updatedData);
      setProducts(prev => prev.map(p => p.id === id ? { ...res.data, id: res.data._id } : p));
    } catch (err) { console.error(err); }
  };
  
  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) { console.error(err); }
  };

  const addCategory = async (category) => {
    try {
      const res = await axios.post(`${API_URL}/categories`, category);
      setCategories(prev => [...prev, { ...res.data, id: res.data._id }]);
    } catch (err) { console.error(err); }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`${API_URL}/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) { console.error(err); }
  };

  // --- ORDER FUNCTION ---
  const addOrder = async (orderData) => {
    try {
      const res = await axios.post(`${API_URL}/orders`, orderData);
      // Add the new order to our state so the reports page updates instantly
      setOrders(prev => [{ ...res.data, id: res.data._id }, ...prev]);
      
      // Refresh products to show deducted stock
      const prodRes = await axios.get(`${API_URL}/products`);
      setProducts(prodRes.data.map(p => ({ ...p, id: p._id })));
    } catch (err) { console.error("Order failed:", err); }
  };

  // Dynamic Dashboard Stats based on real orders
// --- DYNAMIC DASHBOARD STATS ---
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todaysRevenue = orders
    .filter(o => new Date(o.createdAt) >= todayStart)
    .reduce((sum, o) => sum + o.total, 0);

  // Calculate Real Top Selling Product
  const productSales = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.name]) productSales[item.name] = 0;
      productSales[item.name] += item.quantity;
    });
  });

  let topProduct = "No Sales Yet";
  let topProductSales = 0;

  for (const [name, qty] of Object.entries(productSales)) {
    if (qty > topProductSales) {
      topProductSales = qty;
      topProduct = name;
    }
  }

  const dashboardStats = {
    todaysRevenue, 
    topProduct,
    topProductSales
  };

  return (
    <InventoryContext.Provider value={{ 
      products, addProduct, editProduct, deleteProduct,
      categories, addCategory, deleteCategory,
      orders, addOrder,
      isAuthenticated, login, logout,
      dashboardStats
    }}>
      {children}
    </InventoryContext.Provider>
  );
};