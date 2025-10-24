"use client";

import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

// --- Types ---
interface User {
  id: string;
  name: string;
  token: string;
  createdAt: string;
  updatedAt: string;
}

// --- Helpers ---
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

// --- Icons ---
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const WarningIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

// --- Page Component ---
export default function UsersPage() {
  // --- States ---
  const [users, setUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const token = Cookies.get("kashier-token");

  // --- Fetch Users ---
  const fetchUsers = async () => {
    setIsUsersLoading(true);
    setUsersError(null);
    if (!token) {
      setUsersError("Authentication token not found.");
      setIsUsersLoading(false);
      return;
    }
    try {
      const response = await axios.get(
        "https://kashierapp.sendiko.my.id/api/v1/user",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      let msg = "Failed to fetch users.";
      if (axios.isAxiosError(err)) {
        // @ts-ignore
        msg = err.response?.data?.message || err.message;
      }
      setUsersError(msg);
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Delete Modal Handlers ---
  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // --- Delete User ---
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    if (!token) {
      setUsersError("Authentication token not found.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.delete(
        `https://kashierapp.sendiko.my.id/api/v2/user/${userToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchUsers(); // Refetch users after delete
      closeDeleteModal();
    } catch (err) {
      const error = err as AxiosError;
      console.error("Failed to delete user:", error);
      setUsersError(
        `Failed to delete user. ${
          // @ts-ignore
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Table Content ---
  const renderUsersTableContent = () => {
    if (isUsersLoading) {
      return (
        <tr>
          <td colSpan={4} className="py-4 text-center text-gray-500">
            Loading users...
          </td>
        </tr>
      );
    }
    if (usersError && users.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="py-4 text-center text-red-500">
            {usersError}
          </td>
        </tr>
      );
    }
    if (users.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="py-4 text-center text-gray-500">
            No users found.
          </td>
        </tr>
      );
    }
    return users.map((user) => (
      <tr
        key={user.id}
        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <td className="px-6 py-4">{user.id}</td>
        <td className="px-6 py-4 font-medium">{user.name}</td>
        <td className="px-6 py-4 text-sm text-gray-500">
          {formatDate(user.createdAt)}
        </td>
        <td className="px-6 py-4 flex gap-2 justify-end">
          <button
            onClick={() => openDeleteModal(user)}
            title="Delete User"
            className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-700 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </td>
      </tr>
    ));
  };

  // --- Render ---
  return (
    <div className="dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Manage Users</h1>
        {/* No "Add New User" button */}
      </div>

      {/* Table */}
      <div className="mt-10">
        {usersError && users.length > 0 && (
           <div className="mb-4 text-red-500 text-sm">{usersError}</div>
        )}
        <div className="overflow-x-auto rounded-lg bg-white shadow-md dark:bg-gray-800">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Created At</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>{renderUsersTableContent()}</tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex flex-col items-center p-6">
              <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
                <WarningIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-semibold mt-4">Delete User</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-center">
                Are you sure you want to delete user "{userToDelete.name}"? This
                action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end p-6 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 rounded-b-lg">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isSubmitting}
                className="mr-3 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

