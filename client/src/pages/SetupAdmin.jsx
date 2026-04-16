import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SetupAdmin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleSetup = async (e) => {
    e.preventDefault();
    setStatus('Creating...');
    
    // 1. ADD THIS LINE: Define the dynamic URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    try {
      // 2. UPDATE THIS LINE: Use the new API_URL variable instead of hardcoding localhost
      const res = await axios.post(`${API_URL}/auth/register`, {
        username,
        password
      });
      
      setStatus('✅ ' + res.data.message + ' Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setStatus('❌ ' + (err.response?.data?.message || 'Failed to create admin. Check backend console.'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          🛠️ Initial Admin Setup
        </h2>
        <p className="text-center text-red-500 mt-2 font-medium">
          Use this page ONCE, then delete the code!
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-2 border-red-200">
          <form className="space-y-6" onSubmit={handleSetup}>
            {status && (
              <div className="bg-gray-50 text-gray-800 p-3 rounded-lg text-sm text-center font-medium">
                {status}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">New Admin Username</label>
              <input 
                type="text" required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm outline-none focus:border-blue-500" 
                value={username} onChange={(e) => setUsername(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input 
                type="password" required minLength="6"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm outline-none focus:border-blue-500" 
                value={password} onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
              Create Admin Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupAdmin;