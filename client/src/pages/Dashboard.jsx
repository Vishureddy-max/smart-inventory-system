import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, Award } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

const Dashboard = () => {
  const { products, orders, dashboardStats } = useInventory(); 

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  // --- DYNAMIC 7-DAY REVENUE GRAPH ---
  // 1. Generate the last 7 days labels (e.g., 'Mon', 'Tue')
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  // 2. Initialize chart data with 0 revenue
  const chartData = last7Days.map(day => ({
    name: day.toLocaleDateString('en-US', { weekday: 'short' }),
    fullDate: day.toDateString(),
    revenue: 0
  }));

  // 3. Fill with real order data
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0,0,0,0);

  orders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    if (orderDate >= sevenDaysAgo) {
      const orderDayStr = orderDate.toDateString();
      const dayData = chartData.find(d => d.fullDate === orderDayStr);
      if (dayData) dayData.revenue += order.total;
    }
  });

  // Calculate growth percentage for the graph
  const todayRev = chartData[6].revenue;
  const yesterdayRev = chartData[5].revenue;
  const growth = yesterdayRev === 0 ? 100 : ((todayRev - yesterdayRev) / yesterdayRev) * 100;

  return (
    <div className="w-full space-y-6 block">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Welcome back, Admin</h2>
        <p className="text-gray-500 mt-1">{today}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm w-full">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Last 7 Days Revenue</h3>
              <p className="text-sm text-gray-500 mt-1">Track your weekly performance</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${growth >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <TrendingUp size={16} className={growth < 0 ? "rotate-180" : ""} /> 
              {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
            </div>
          </div>

          <div className="h-[300px] w-full min-w-[1px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm w-full">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Package size={24} />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Products</p>
            <h4 className="text-3xl font-semibold text-gray-900">{products.length}</h4>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm w-full">
            <div className="h-12 w-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">₹</span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Today's Revenue</p>
            <h4 className="text-3xl font-semibold text-gray-900 mb-2">₹{dashboardStats.todaysRevenue.toLocaleString('en-IN')}</h4>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm w-full">
            <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
              <Award size={24} />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Top Selling Product</p>
            <h4 className="text-xl font-semibold text-gray-900 mb-2 truncate" title={dashboardStats.topProduct}>
              {dashboardStats.topProduct}
            </h4>
            <p className="text-sm text-gray-500">{dashboardStats.topProductSales} units sold</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;