import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Package, Download, Calendar } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- FIXED THE IMPORT!

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

const Reports = () => {
  const { products, orders } = useInventory();

  // --- STATE FOR FILTERS ---
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // --- DATA PROCESSING: INVENTORY ---
  const { totalValue, totalStock, lowStockItems, categoryData } = useMemo(() => {
    let value = 0; let stock = 0;
    const lowStock = []; const catMap = {};

    products.forEach(p => {
      const pStock = Number(p.stock) || 0;
      const pPrice = Number(p.price) || 0;
      value += (pStock * pPrice); stock += pStock;
      if (pStock < 10) lowStock.push(p);

      const cat = p.category || 'Uncategorized';
      if (!catMap[cat]) catMap[cat] = { name: cat, stock: 0, value: 0 };
      catMap[cat].stock += pStock; catMap[cat].value += (pStock * pPrice);
    });

    return {
      totalValue: value, totalStock: stock,
      lowStockItems: lowStock.sort((a, b) => a.stock - b.stock),
      categoryData: Object.values(catMap)
    };
  }, [products]);

  // --- APPLY DATE FILTERS ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0); // Normalize time
      
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (orderDate < from) return false;
      }
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(0, 0, 0, 0);
        if (orderDate > to) return false;
      }
      return true;
    });
  }, [orders, fromDate, toDate]);

  // --- DATA PROCESSING: SALES & ORDERS (USING FILTERED DATA) ---
  const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrdersCount = filteredOrders.length;

  const monthlyData = filteredOrders.reduce((acc, order) => {
    const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
    const existing = acc.find(item => item.name === month);
    if (existing) existing.revenue += order.total;
    else acc.push({ name: month, revenue: order.total });
    return acc;
  }, []);

  const chartData = monthlyData.length > 0 ? monthlyData : [
    { name: 'Jan', revenue: 0 }, { name: 'Feb', revenue: 0 },
    { name: 'Mar', revenue: 0 }, { name: 'Apr', revenue: 0 },
    { name: 'May', revenue: 0 }, { name: 'Jun', revenue: 0 }
  ];

  const getPaymentPill = (mode) => {
    if (mode === 'Cash') return 'bg-green-50 text-green-600';
    if (mode === 'UPI') return 'bg-blue-50 text-blue-600';
    return 'bg-purple-50 text-purple-600';
  };

  // --- PDF REPORT GENERATION ---
  const downloadReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text("Inventory Status Report", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 30);
    doc.text(`Total Inventory Value: Rs. ${totalValue.toLocaleString('en-IN')}`, 14, 38);
    doc.text(`Total Items in Stock: ${totalStock} units`, 14, 44);

    const tableColumn = ["Product Name", "Category", "Price (Rs.)", "Current Stock", "Total Value (Rs.)"];
    const tableRows = products.map(p => [
      p.name, p.category, 
      (Number(p.price) || 0).toLocaleString('en-IN'), 
      (Number(p.stock) || 0).toString(),
      ((Number(p.price) || 0) * (Number(p.stock) || 0)).toLocaleString('en-IN')
    ]);

    autoTable(doc, { // <-- FIXED THE AUTOTABLE CALL!
      startY: 55, head: [tableColumn], body: tableRows,
      theme: 'grid', headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9 }, alternateRowStyles: { fillColor: [245, 247, 250] }
    });

    doc.save(`Inventory_Report_${Date.now()}.pdf`);
  };

  return (
    <div className="w-full h-full block space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reports & Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Track your business performance and inventory health</p>
        </div>
        <button onClick={downloadReport} className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Download size={18} /> Download Full Report
        </button>
      </div>

      {/* Date Filter Box */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">From</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar size={16} className="text-gray-400" /></div>
            <input type="date" className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">To</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar size={16} className="text-gray-400" /></div>
            <input type="date" className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>
        <button onClick={() => { /* Filters apply automatically via useMemo, but we keep the button for UX */ }} className="bg-[#2563EB] hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm h-[38px]">
          Apply Filter
        </button>
      </div>

      {/* Sales Performance Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Sales Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4"><TrendingUp size={20} /></div>
            <p className="text-sm font-medium text-gray-500">Total Sales (Filtered)</p>
            <h4 className="text-3xl font-bold text-gray-900 mt-1">₹{totalSales.toLocaleString('en-IN')}</h4>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative">
            <div className="h-10 w-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4"><Package size={20} /></div>
            <p className="text-sm font-medium text-gray-500">Total Orders (Filtered)</p>
            <h4 className="text-3xl font-bold text-gray-900 mt-1">{totalOrdersCount}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          <p className="text-sm text-gray-500 mb-6">Monthly sales performance</p>
          <div className="h-[300px] w-full min-w-[1px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100"><h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3></div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Invoice ID</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Amount</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Payment Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">No invoices found for this date range.</td></tr>
                ) : (
                  filteredOrders.slice(0, 10).map((order, index) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">INV-{String(filteredOrders.length - index).padStart(3, '0')}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{order.total.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentPill(order.paymentMode)}`}>{order.paymentMode || 'Cash'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <hr className="border-gray-200 my-8" />

      {/* Inventory Health Section (Unchanged from previous) */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Inventory Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><TrendingUp size={24} /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Inventory Value</p>
                <h4 className="text-2xl font-bold text-gray-900">₹{totalValue.toLocaleString('en-IN')}</h4>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><Package size={24} /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Physical Stock</p>
                <h4 className="text-2xl font-bold text-gray-900">{totalStock.toLocaleString('en-IN')} units</h4>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><AlertTriangle size={24} /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Low Stock Alerts</p>
                <h4 className="text-2xl font-bold text-gray-900">{lowStockItems.length} items</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Stock Distribution</h3>
            <div className="h-[300px] w-full min-w-[1px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="stock" fill="#10B981" radius={[4, 4, 0, 0]} name="Units in Stock" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Value by Category</h3>
            <div className="flex-1 h-[300px] w-full min-w-[1px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;