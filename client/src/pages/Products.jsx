import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

const Products = () => {
  const { products, addProduct, editProduct, deleteProduct, categories } = useInventory();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('All Categories');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: '', price: '', stock: '' });

  // Safety check: ensure categories exist before setting a default
  useEffect(() => {
    if (categories && categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories]);

  // Bulletproof Filtering
  const filteredProducts = products.filter(product => {
    const safeName = product?.name || '';
    const safeCategory = product?.category || '';
    
    const matchesSearch = safeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedFilterCategory === 'All Categories' || safeCategory === selectedFilterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ 
      name: '', 
      category: categories.length > 0 ? categories[0].name : 'Uncategorized', 
      price: '', 
      stock: '' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormData({ 
      name: product.name || '', 
      category: product.category || '', 
      price: product.price || '', 
      stock: product.stock || '' 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Force clean data types so MongoDB doesn't reject the request
    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      price: Number(formData.price) || 0,
      stock: Number(formData.stock) || 0
    };

    if (editingId) {
      editProduct(editingId, payload);
    } else {
      addProduct(payload);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="w-full bg-white h-full block relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Product Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your inventory and products</p>
        </div>
        <button 
          onClick={openAddModal} 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={18} strokeWidth={2.5} /> Add Product
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-sm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <select 
          className="bg-white border border-gray-200 text-sm rounded-2xl px-5 py-2.5 outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer min-w-[160px]" 
          value={selectedFilterCategory} 
          onChange={(e) => setSelectedFilterCategory(e.target.value)}
        >
          <option value="All Categories">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-2 py-4 text-sm font-semibold text-gray-800">Product Name</th>
              <th className="px-2 py-4 text-sm font-semibold text-gray-800">Category</th>
              <th className="px-2 py-4 text-sm font-semibold text-gray-800">Price</th>
              <th className="px-2 py-4 text-sm font-semibold text-gray-800">Stock</th>
              <th className="px-2 py-4 text-sm font-semibold text-gray-800 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                {/* Fallbacks applied to EVERY field */}
                <td className="px-2 py-5 text-sm text-gray-800 font-medium">
                  {product.name || 'Unnamed Product'}
                </td>
                <td className="px-2 py-5">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-medium">
                    {product.category || 'Uncategorized'}
                  </span>
                </td>
                <td className="px-2 py-5 text-sm text-gray-800">
                  ₹{(Number(product.price) || 0).toLocaleString('en-IN')}
                </td>
                <td className="px-2 py-5">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${Number(product.stock) > 10 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    {Number(product.stock) || 0} units
                  </span>
                </td>
                <td className="px-2 py-5 text-right">
                  <div className="flex items-center justify-end gap-4 opacity-80 group-hover:opacity-100">
                    <button onClick={() => openEditModal(product)} className="text-blue-500 hover:text-blue-700">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-sm text-gray-500 pb-8 font-medium">
        Showing {filteredProducts.length} out of {products.length} total products
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-semibold mb-6">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input 
                  required 
                  type="text" 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-600" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  required 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-600 bg-white" 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {/* If no categories exist, provide a fallback option */}
                  {categories.length === 0 && <option value="Uncategorized">Uncategorized</option>}
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input 
                    required 
                    type="number" 
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-600" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})} 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input 
                    required 
                    type="number" 
                    min="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-600" 
                    value={formData.stock} 
                    onChange={e => setFormData({...formData, stock: e.target.value})} 
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-6"
              >
                {editingId ? 'Update Product' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;