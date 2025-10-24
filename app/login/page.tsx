"use client";

import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie'; // Import js-cookie

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Mock login for "admin" / "password"
    if (username === 'admin' && password === 'password') {
      console.log('Mock login successful');
      // Set a mock token for testing
      Cookies.set('kashier-token', 'mock-test-token-123', { expires: 1, path: '/' });
      window.location.href = '/'; // Redirect to dashboard
      return;
    }

    try {
      const response = await axios.post(
        'https://kashierapp.sendiko.my.id/api/v3/login',
        {
          name: username,
          password: password,
        }
      );

      // Check if the response has the data and token
      if (response.data && response.data.token) {
        console.log('Login successful, token received.');
        
        // Save the token to a cookie
        // It will expire in 1 day and be accessible on all pages
        Cookies.set('kashier-token', response.data.token, { expires: 1, path: '/' });

        // Redirect to the dashboard
        // We use window.location.href for a simple redirect
        window.location.href = '/'; 

      } else {
        // Handle cases where login is "successful" but no token is returned
        setError(response.data.message || 'Login successful but no token was provided.');
      }

    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'An unknown error occurred.';
      if (axios.isAxiosError(err) && err.response) {
        // Use the error message from the API if available
        errorMessage = err.response.data.message || `Error: ${err.response.status}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 shadow-2xl">
        
        <h1 className="mb-6 text-center text-3xl font-bold text-white">
          Kashier Admin
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label 
              htmlFor="username" 
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="admin"
            />
          </div>

          {/* Password Field */}
          <div>
            <label 
              htmlFor="password" 
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-900/50 p-3 text-center text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full rounded-lg bg-indigo-600 px-5 py-3 text-center font-medium text-white 
              transition-all duration-200 
              hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-800
              ${isLoading ? 'cursor-not-allowed opacity-50' : ''}
            `}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}