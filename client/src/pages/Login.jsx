import { useState } from 'react';
import { ShoppingCart, Lock, User } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useInventory();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600">
          <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg">
            <ShoppingCart size={32} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Retail System Admin
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input 
                  type="text" required 
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
                  value={username} onChange={(e) => setUsername(e.target.value)} 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input 
                  type="password" required 
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
                  value={password} onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              Sign in to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;