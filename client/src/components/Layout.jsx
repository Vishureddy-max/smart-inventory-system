import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  ShoppingCart, LayoutDashboard, Package, FolderOpen, ReceiptText, BarChart3, User, LogOut
} from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Categories', path: '/categories', icon: FolderOpen },
    { name: 'Billing', path: '/billing', icon: ReceiptText },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <ShoppingCart size={20} />
            </div>
            <span className="font-bold text-lg text-gray-900">Retail System</span>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500'} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen w-full min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 w-full">
          <h1 className="text-xl font-semibold">
            {navItems.find(item => location.pathname.includes(item.path))?.name || 'Dashboard'}
          </h1>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors">
              <User size={16} className="text-gray-500" />
              Admin
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto p-8 w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;