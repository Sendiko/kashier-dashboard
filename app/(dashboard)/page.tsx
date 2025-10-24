"use client"; // This must be a client component to fetch data

import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

// Define a type for our item data
interface Item {
  id: number;
  name: string;
  price: number;
  createdAt: string;
  userId: string;
}

// Define a type for our history data
interface History {
  id: number;
  total: number;
  items: number; // This is the count of items
  createdAt: string;
  userId: string;
}

// Define a type for our user data
interface User {
  id: string; // User ID is a string
  name: string;
  token: string; // We'll fetch this but not display it
  createdAt: string;
  updatedAt: string;
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function DashboardPage() {
  // State for Items
  const [items, setItems] = useState<Item[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);

  // State for Histories
  const [histories, setHistories] = useState<History[]>([]);
  const [isHistoriesLoading, setIsHistoriesLoading] = useState(true);
  const [historiesError, setHistoriesError] = useState<string | null>(null);

  // State for Users
  const [users, setUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);


  useEffect(() => {
    const token = Cookies.get('kashier-token');
    
    // Function to handle redirection (REMOVED)
    const redirectToLogin = () => {
      window.location.href = window.location.origin + '/login';
    };

    if (!token) {
      redirectToLogin();
      setItemsError('Authentication token not found.');
      setHistoriesError('Authentication token not found.');
      setUsersError('Authentication token not found.'); // Add error for users
      return;
    }

    // --- 1. Fetch Items ---
    const fetchItems = async () => {
      setIsItemsLoading(true);
      setItemsError(null);
      
      try {
        const response = await axios.get(
          'https://kashierapp.sendiko.my.id/api/v2/item',
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (response.data && Array.isArray(response.data.items)) {
          setItems(response.data.items);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Failed to fetch items:', err);
        let msg = 'Failed to fetch items.';
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            msg = 'Unauthorized. Please log in again.';
            // redirectToLogin(); // Removed redirection
          } else {
            msg = err.response?.data?.message || err.message;
          }
        } else if (err instanceof Error) {
          msg = err.message;
        }
        setItemsError(msg);
      } finally {
        setIsItemsLoading(false);
      }
    };

    // --- 2. Fetch Histories ---
    const fetchHistories = async () => {
      setIsHistoriesLoading(true);
      setHistoriesError(null);
      
      try {
        const response = await axios.get(
          'https://kashierapp.sendiko.my.id/api/v2/history',
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (response.data && Array.isArray(response.data.histories)) {
          setHistories(response.data.histories);
        } else {
          setHistories([]);
        }
      } catch (err) {
        console.error('Failed to fetch histories:', err);
        let msg = 'Failed to fetch histories.';
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            msg = 'Unauthorized. Please log in again.';
            // Only one redirect is needed, fetchItems will handle it // Removed comment
          } else {
            msg = err.response?.data?.message || err.message;
          }
        } else if (err instanceof Error) {
          msg = err.message;
        }
        setHistoriesError(msg);
      } finally {
        setIsHistoriesLoading(false);
      }
    };

    // --- 3. Fetch Users ---
    const fetchUsers = async () => {
      setIsUsersLoading(true);
      setUsersError(null);
      
      try {
        const response = await axios.get(
          'https://kashierapp.sendiko.my.id/api/v1/user',
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (response.data && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        let msg = 'Failed to fetch users.';
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            msg = 'Unauthorized. Please log in again.';
          } else {
            msg = err.response?.data?.message || err.message;
          }
        } else if (err instanceof Error) {
          msg = err.message;
        }
        setUsersError(msg);
      } finally {
        setIsUsersLoading(false);
      }
    };


    // Run all fetch operations
    fetchItems();
    fetchHistories();
    fetchUsers();

  }, []); // The empty array [] means this effect runs once

  // --- Render Function for Items Table ---
  const renderItemsTableContent = () => {
    if (isItemsLoading) {
      return (
        <tr>
          <td colSpan={4} className="py-4 text-center text-gray-500">
            Loading items...
          </td>
        </tr>
      );
    }
    if (itemsError) {
       return (
        <tr>
          <td colSpan={4} className="py-4 text-center text-red-500">
            {itemsError}
          </td>
        </tr>
      );
    }
    if (items.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="py-4 text-center text-gray-500">
            No items found.
          </td>
        </tr>
      );
    }
    return items.map((item) => (
      <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
        <td className="px-6 py-4">{item.id}</td>
        <td className="px-6 py-4 font-medium">{item.name}</td>
        <td className="px-6 py-4">{formatCurrency(item.price)}</td>
        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.createdAt)}</td>
      </tr>
    ));
  };

  // --- Render Function for History Table ---
  const renderHistoryTableContent = () => {
    if (isHistoriesLoading) {
      return (
        <tr>
          <td colSpan={4} className="py-4 text-center text-gray-500">
            Loading transactions...
          </td>
        </tr>
      );
    }
    if (historiesError) {
       return (
        <tr>
          <td colSpan={4} className="py-4 text-center text-red-500">
            {historiesError}
          </td>
        </tr>
      );
    }
    if (histories.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="py-4 text-center text-gray-500">
            No transactions found.
          </td>
        </tr>
      );
    }
    return histories.map((history) => (
      <tr key={history.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
        <td className="px-6 py-4">{history.id}</td>
        <td className="px-6 py-4 font-medium">{formatCurrency(history.total)}</td>
        <td className="px-6 py-4">{history.items} items</td>
        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(history.createdAt)}</td>
      </tr>
    ));
  };

  // --- Render Function for Users Table ---
  const renderUsersTableContent = () => {
    if (isUsersLoading) {
      return (
        <tr>
          <td colSpan={3} className="py-4 text-center text-gray-500">
            Loading users...
          </td>
        </tr>
      );
    }
    if (usersError) {
       return (
        <tr>
          <td colSpan={3} className="py-4 text-center text-red-500">
            {usersError}
          </td>
        </tr>
      );
    }
    if (users.length === 0) {
      return (
        <tr>
          <td colSpan={3} className="py-4 text-center text-gray-500">
            No users found.
          </td>
        </tr>
      );
    }
    return users.map((user) => (
      <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
        <td className="px-6 py-4">{user.id}</td>
        <td className="px-6 py-4 font-medium">{user.name}</td>
        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
      </tr>
    ));
  };


  return (
    <div className="text-black dark:text-white">
      <h1 className="mb-6 text-3xl font-bold">Dashboard Overview</h1>

      {/* --- Stat Cards --- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Barang Card */}
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h3 className="mb-2 text-sm font-medium uppercase text-gray-500 dark:text-gray-400">
            Barang
          </h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold">
              {isItemsLoading ? '...' : items.length}
            </span>
          </div>
          <a href="#" className="mt-4 inline-block text-sm text-indigo-500 hover:underline">
            View all
          </a>
        </div>

        {/* Transaksi Card - Now updated with real data */}
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h3 className="mb-2 text-sm font-medium uppercase text-gray-500 dark:text-gray-400">
            Transaksi
          </h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold">
              {isHistoriesLoading ? '...' : histories.length}
            </span>
          </div>
          <a href="#" className="mt-4 inline-block text-sm text-indigo-500 hover:underline">
            View all
          </a>
        </div>

        {/* User Card - Now updated with real data */}
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h3 className="mb-2 text-sm font-medium uppercase text-gray-500 dark:text-gray-400">
            User
          </h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold">
              {isUsersLoading ? '...' : users.length}
            </span>
          </div>
          <a href="#" className="mt-4 inline-block text-sm text-indigo-500 hover:underline">
            View all
          </a>
        </div>
      </div>

      {/* --- Items Table --- */}
      <div className="mt-10">
        <h2 className="mb-4 text-2xl font-semibold">Recent Items</h2>
        <div className="overflow-x-auto rounded-lg bg-white shadow-md dark:bg-gray-800">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Price</th>
                <th scope="col" className="px-6 py-3">Created At</th>
              </tr>
            </thead>
            <tbody>
              {renderItemsTableContent()}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- History Table --- */}
      <div className="mt-10">
        <h2 className="mb-4 text-2xl font-semibold">Recent Transactions</h2>
        <div className="overflow-x-auto rounded-lg bg-white shadow-md dark:bg-gray-800">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Total</th>
                <th scope="col" className="px-6 py-3">Items</th>
                <th scope="col" className="px-6 py-3">Created At</th>
              </tr>
            </thead>
            <tbody>
              {renderHistoryTableContent()}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Users Table --- */}
      <div className="mt-10">
        <h2 className="mb-4 text-2xl font-semibold">Recent Users</h2>
        <div className="overflow-x-auto rounded-lg bg-white shadow-md dark:bg-gray-800">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Created At</th>
              </tr>
            </thead>
            <tbody>
              {renderUsersTableContent()}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}