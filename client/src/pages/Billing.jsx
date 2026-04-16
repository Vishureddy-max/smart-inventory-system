import { useState } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- We import it as a standalone function
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
const Billing = () => {
  const { products, addOrder } = useInventory(); // <-- Grab addOrder
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [gstPercent, setGstPercent] = useState(18);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash');

  const filteredProducts = products.filter(product => {
    const safeName = product?.name || '';
    return safeName.toLowerCase().includes(searchTerm.toLowerCase());
  });
// --- INVISIBLE BARCODE SCANNER ---
  useBarcodeScanner((scannedCode) => {
    // For now, let's assume the barcode matches the product name perfectly (or add a 'barcode' field to your DB later)
    const productToExpand = products.find(p => 
      p.name.toLowerCase() === scannedCode.toLowerCase() || 
      p.id === scannedCode
    );
    
    if (productToExpand) {
      addToCart(productToExpand);
      // Optional: Play a "beep" sound here!
    } else {
      alert(`Product not found for barcode: ${scannedCode}`);
    }
  });
  // --- Cart Logic ---
  const addToCart = (product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if (product.stock > 0) return [...prev, { ...product, quantity: 1 }];
      return prev;
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        if (newQuantity > 0 && newQuantity <= item.stock) return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

  // --- Math Calculations ---
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const gstAmount = subtotal * (Number(gstPercent) / 100);
  const discountAmount = subtotal * (Number(discountPercent) / 100);
  const total = Math.max(0, subtotal + gstAmount - discountAmount);

  // --- PDF GENERATION LOGIC ---
  const handleGenerateBill = async () => { 
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    // 1. Send the order to MongoDB
    const orderPayload = {
      items: cart.map(item => ({
        productId: item.id, 
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity
      })),
      subtotal: subtotal,
      gstPercent: Number(gstPercent),
      gstAmount: gstAmount,
      discountPercent: Number(discountPercent),
      discountAmount: discountAmount,
      total: total,
      paymentMode: paymentMode
    };

    await addOrder(orderPayload);

    // 2. Build the PDF 
    const receiptHeight = 110 + (cart.length * 8); 
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, receiptHeight] });

    // --- HEADER ---
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("TEAM 44 ATT", 40, 10, { align: 'center' }); 
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text("Smart Retail System", 40, 16, { align: 'center' });
    doc.text("------------------------------------------------", 40, 20, { align: 'center' });

    // --- INVOICE DETAILS ---
    doc.text(`Invoice: INV-${Math.floor(100000 + Math.random() * 900000)}`, 5, 26);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}  ${new Date().toLocaleTimeString('en-IN')}`, 5, 31);
    doc.text(`Payment: ${paymentMode}`, 5, 36);
    doc.text("------------------------------------------------", 40, 41, { align: 'center' });

    // --- TABLE HEADERS ---
    doc.setFont(undefined, 'bold');
    doc.text("Item", 5, 46);
    doc.text("Qty", 45, 46, { align: 'center' });
    doc.text("Total", 75, 46, { align: 'right' }); // Anchored to right margin!
    doc.setFont(undefined, 'normal');
    doc.text("------------------------------------------------", 40, 50, { align: 'center' });

    // --- TABLE ITEMS ---
    let yPos = 56;
    cart.forEach(item => {
      const shortName = item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name;
      const itemTotal = Number(item.price) * item.quantity;
      
      doc.text(shortName, 5, yPos);
      doc.text(item.quantity.toString(), 45, yPos, { align: 'center' });
      // GROWING LEFTWARDS:
      doc.text(itemTotal.toLocaleString('en-IN'), 75, yPos, { align: 'right' });
      yPos += 7;
    });

    // --- FINANCIAL SUMMARY ---
    doc.text("------------------------------------------------", 40, yPos, { align: 'center' });
    yPos += 7;
    
    doc.text(`Subtotal:`, 35, yPos); 
    doc.text(`Rs. ${subtotal.toLocaleString('en-IN')}`, 75, yPos, { align: 'right' });
    yPos += 6;
    
    doc.text(`GST (${gstPercent || 0}%):`, 35, yPos);
    doc.text(`Rs. ${gstAmount.toLocaleString('en-IN')}`, 75, yPos, { align: 'right' });
    yPos += 6;
    
    doc.setTextColor(239, 68, 68); 
    doc.text(`Discount:`, 35, yPos);
    doc.text(`- Rs. ${discountAmount.toLocaleString('en-IN')}`, 75, yPos, { align: 'right' });
    
    doc.setTextColor(0, 0, 0); 
    yPos += 8;

    // --- GRAND TOTAL ---
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL:`, 35, yPos); 
    // Anchored to the exact same 75mm safe-line, guaranteed to fit!
    doc.text(`Rs. ${total.toLocaleString('en-IN')}`, 75, yPos, { align: 'right' });

    // --- FOOTER ---
    yPos += 12;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text("Thank you for your business!", 40, yPos, { align: 'center' });

    // Trigger Download
    doc.save(`Receipt_${Date.now()}.pdf`);

    setCart([]);
    setSearchTerm('');
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-6 block">
      
      {/* LEFT SIDE: Products Grid */}
      <div className="flex-1 flex flex-col h-full min-h-0">
        <div className="mb-6 shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Point of Sale</h2>
          <p className="text-sm text-gray-500 mt-1 mb-4">Select products to add to cart</p>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-sm" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {/* Scrollable Products Grid */}
        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1" title={product.name}>
                    {product.name || 'Unnamed'}
                  </h3>
                  <span className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs mb-4">
                    {product.category || 'Uncategorized'}
                  </span>
                </div>
                
                <div className="flex justify-between items-end mt-2">
                  <div>
                    <div className="text-blue-600 font-bold text-lg">
                      ₹{(Number(product.price) || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </div>
                  </div>
                  <button 
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                      product.stock > 0 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            ))}
            
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No products found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Cart Sidebar */}
      <div className="w-full lg:w-96 bg-white border border-gray-200 rounded-2xl flex flex-col shrink-0 h-fit lg:h-[calc(100vh-8rem)] overflow-hidden">
        
        {/* Cart Header */}
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <ShoppingCart size={20} className="text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Cart ({cart.length})</h2>
        </div>

        {/* Cart Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[150px]">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Your cart is empty
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex-1 pr-3">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</h4>
                  <div className="text-xs text-gray-500 mt-1">₹{Number(item.price).toLocaleString('en-IN')}</div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer / Calculations */}
        <div className="p-5 bg-gray-50/50 border-t border-gray-100">
          
          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600 font-medium">GST %</label>
              <input 
                type="number" min="0" 
                className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 text-right"
                value={gstPercent} onChange={(e) => setGstPercent(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600 font-medium">Discount %</label>
              <input 
                type="number" min="0" 
                className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-600 text-right"
                value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 mb-5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>GST ({gstPercent || 0}%)</span>
              <span className="font-medium text-gray-900">₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Discount ({discountPercent || 0}%)</span>
              <span className="font-medium text-red-500">-₹{discountAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
              <span className="text-base font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-blue-600">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs text-gray-500 font-medium mb-1.5">Payment Mode</label>
            <select 
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-600 bg-white"
              value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Credit/Debit Card</option>
            </select>
          </div>

          <button 
            onClick={handleGenerateBill}
            className="w-full bg-[#7CA8FF] hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
          >
            Generate Bill
          </button>
        </div>

      </div>
    </div>
  );
};

export default Billing;