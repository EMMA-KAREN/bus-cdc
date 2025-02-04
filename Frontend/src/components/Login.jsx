import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from "../context/UserContext";
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get the role from the query string
  const role = new URLSearchParams(location.search).get('role');

  // Access the context
  const { login } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
     
      await login(email, password);

     
      const userRole = role === 'admin' ? 'adminDashboard' : 'user/dashboard';
      navigate(`/${userRole}`);
    } catch (error) {
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="bg-white p-8 shadow-2xl rounded-lg w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Login as {role === 'admin' ? 'Admin' : 'User'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>
        {error && <div className="text-red-500 text-center mt-4">{error}</div>}
        <div className="text-center mt-4 text-sm">
          <a href="/forgot-password" className="text-blue-600 hover:text-blue-700">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
