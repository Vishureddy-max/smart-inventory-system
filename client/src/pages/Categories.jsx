import { useState } from 'react';
import { Plus, Folder, Edit, Trash2, X } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

const Categories = () => {
  const { categories, products, addCategory, deleteCategory } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Helper to get Tailwind colors based on the color string
  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      orange: 'bg-orange-50 text-orange-600',
      purple: 'bg-purple-50 text-purple-600',
      pink: 'bg-pink-50 text-pink-600',
      teal: 'bg-teal-50 text-teal-600',
      default: 'bg-gray-50 text-gray-600'
    };
    return colorMap[color] || colorMap.default;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    // Pick a random color for new categories
    const colors = ['blue', 'green', 'orange', 'purple', 'pink', 'teal'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    addCategory({ name: newCatName, color: randomColor });
    setNewCatName('');
    setIsModalOpen(false);
  };

  return (
    <div className="w-full bg-white h-full block">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
          <p className="text-sm text-gray-500 mt-1">Organize your products by categories</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          // Dynamically count products in this category
          const productCount = products.filter(p => p.category === category.name).length;

          return (
            <div key={category.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${getColorClasses(category.color)}`}>
                  <Folder size={24} strokeWidth={2} />
                </div>
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-blue-500 hover:text-blue-700"><Edit size={16} /></button>
                  <button onClick={() => deleteCategory(category.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{productCount} products</p>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <h3 className="text-xl font-semibold mb-6">Add New Category</h3>
            <form onSubmit={handleAdd}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input required type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-600" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors">Save Category</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;