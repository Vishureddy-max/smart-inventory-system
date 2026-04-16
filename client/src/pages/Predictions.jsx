import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrainCircuit, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

const Predictions = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      // 1. ADD THIS LINE: Define the dynamic URL
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      try {
        // 2. UPDATE THIS LINE: Use the new API_URL variable
        const res = await axios.get(`${API_URL}/analytics/predictions`);
        setInsights(res.data);
      } catch (err) {
        console.error("Failed to load insights", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  const getStatusStyle = (color) => {
    switch(color) {
      case 'green': return 'bg-green-50 text-green-700 border-green-200';
      case 'red': return 'bg-red-50 text-red-700 border-red-200';
      case 'orange': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Running prediction models...</div>;

  return (
    <div className="w-full h-full block space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit size={28} /> Smart Insights Engine
          </h2>
          <p className="text-blue-100 mt-2">Data-driven decisions for inventory optimization and profitability.</p>
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Keepers Column */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-green-600">
            <TrendingUp size={20} /> <h3 className="font-bold text-lg text-gray-900">The Cash Cows</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">High revenue drivers. Keep these fully stocked.</p>
          <div className="space-y-3">
            {insights.filter(i => i.statusColor === 'green').map(item => (
              <div key={item.id} className="p-3 bg-green-50/50 border border-green-100 rounded-xl">
                <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                <p className="text-xs text-green-700 mt-1">₹{item.revenue30d.toLocaleString('en-IN')} revenue (30d)</p>
              </div>
            ))}
          </div>
        </div>

        {/* Drop Column */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-red-600">
            <TrendingDown size={20} /> <h3 className="font-bold text-lg text-gray-900">Dead Weight</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">Zero sales in 30 days. Liquidate to free up capital.</p>
          <div className="space-y-3">
            {insights.filter(i => i.statusColor === 'red').map(item => (
              <div key={item.id} className="p-3 bg-red-50/50 border border-red-100 rounded-xl">
                <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                <p className="text-xs text-red-600 mt-1">{item.currentStock} units wasting shelf space</p>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Restock Column */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-orange-600">
            <AlertCircle size={20} /> <h3 className="font-bold text-lg text-gray-900">Stockout Risk</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">Predicted to run out of stock in under 7 days.</p>
          <div className="space-y-3">
            {insights.filter(i => i.statusColor === 'orange').map(item => (
              <div key={item.id} className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl">
                <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                <p className="text-xs font-bold text-orange-600 mt-1">Stockout in ~{item.daysUntilStockout} days!</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Full Decision Matrix Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-6">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Complete Decision Matrix</h3>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Velocity (30d)</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Est. Stockout</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">AI Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {insights.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.unitsSold30d} sold</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">
                    {item.daysUntilStockout === '999+' ? 'No Data' : `${item.daysUntilStockout} days`}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`px-3 py-2 rounded-lg border text-xs font-semibold ${getStatusStyle(item.statusColor)}`}>
                      <span className="block mb-0.5 uppercase tracking-wider">{item.recommendation}</span>
                      <span className="font-normal opacity-80">{item.action}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Predictions;