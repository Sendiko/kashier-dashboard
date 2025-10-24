"use client";

import { useState, useEffect, FormEvent } from "react";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import MultiSelectDropdown from "@/app/components/MultiSelectDropDown";
// Make sure this import path is correct for your project structure

// --- Types ---
interface History {
  id: number;
  total: number;
  items: number; // Item count
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// New Item interface - must be available here for MultiSelectDropdown prop
interface Item {
  id: number;
  name: string;
  price: number;
}

interface User {
  id: string;
  name: string;
}

type ModalMode = "create" | "update";

// --- Helpers ---
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

// --- Icons ---
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    height="1.5em"
    width="1.5em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);

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
export default function HistoriesPage() {
  // --- States ---
  const [histories, setHistories] = useState<History[]>([]);
  const [isHistoriesLoading, setIsHistoriesLoading] = useState(true);
  const [historiesError, setHistoriesError] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // State for fetching available items
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [isAvailableItemsLoading, setIsAvailableItemsLoading] = useState(true);
  const [availableItemsError, setAvailableItemsError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState<History | null>(null);

  const [currentHistoryId, setCurrentHistoryId] = useState<number | null>(null);

  // Form states
  const [total, setTotal] = useState(0); // Total is now calculated based on selected items
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]); // Stores selected item IDs
  const [userId, setUserId] = useState("");

  const token = Cookies.get("kashier-token");

  // --- Fetch Histories ---
  const fetchHistories = async () => {
    setIsHistoriesLoading(true);
    setHistoriesError(null);
    try {
      const response = await axios.get(
        "https://kashierapp.sendiko.my.id/api/v2/history",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data && Array.isArray(response.data.histories)) {
        setHistories(response.data.histories);
      } else {
        setHistories([]);
      }
    } catch (err) {
      console.error("Failed to fetch histories:", err);
      let msg = "Failed to fetch histories.";
      if (axios.isAxiosError(err)) {
        // @ts-ignore
        msg = err.response?.data?.message || err.message;
      }
      setHistoriesError(msg);
    } finally {
      setIsHistoriesLoading(false);
    }
  };

  // --- Fetch Users ---
  const fetchUsers = async () => {
    setIsUsersLoading(true);
    setUsersError(null);
    if (!token) {
      setUsersError("Token not found.");
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

  // --- Fetch Available Items ---
  const fetchAvailableItems = async () => {
    setIsAvailableItemsLoading(true);
    setAvailableItemsError(null);
    if (!token) {
      setAvailableItemsError("Token not found.");
      setIsAvailableItemsLoading(false);
      return;
    }
    try {
      const response = await axios.get(
        "https://kashierapp.sendiko.my.id/api/v2/item",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data && Array.isArray(response.data.items)) {
        setAvailableItems(response.data.items);
      } else {
        setAvailableItems([]);
      }
    } catch (err) {
      console.error("Failed to fetch available items:", err);
      let msg = "Failed to fetch available items.";
      if (axios.isAxiosError(err)) {
        // @ts-ignore
        msg = err.response?.data?.message || err.message;
      }
      setAvailableItemsError(msg);
    } finally {
      setIsAvailableItemsLoading(false);
    }
  };


  useEffect(() => {
    if (token) {
      fetchHistories();
      fetchUsers();
      fetchAvailableItems(); // Fetch items on load
    } else {
      setHistoriesError("Authentication token not found.");
      setUsersError("Authentication token not found.");
      setAvailableItemsError("Authentication token not found.");
      setIsHistoriesLoading(false);
      setIsUsersLoading(false);
      setIsAvailableItemsLoading(false);
    }
  }, [token]); // Added token as dependency

  // --- Calculate Total when selected items change ---
  useEffect(() => {
    let newTotal = 0;
    selectedItemIds.forEach(id => {
      const item = availableItems.find(i => String(i.id) === id); // Compare stringified IDs
      if (item) {
        newTotal += item.price;
      }
    });
    setTotal(newTotal);
  }, [selectedItemIds, availableItems]);


  // --- Modal Handling ---
  const openModal = (mode: ModalMode, history: History | null = null) => {
    setIsModalOpen(true);
    setModalMode(mode);
    setIsSubmitting(false);
    setHistoriesError(null);

    if (mode === "update" && history) {
      setCurrentHistoryId(history.id);
      // For update, we assume we can't perfectly reconstruct the original selected items
      // based only on total and count. So we clear selections for a fresh start.
      setSelectedItemIds([]);
      setTotal(history.total); // Keep the history's total for display, but it won't be edited
      setUserId(history.userId);
    } else {
      setCurrentHistoryId(null);
      setTotal(0);
      setSelectedItemIds([]);
      setUserId(users.length > 0 ? users[0].id : ""); // Pre-select first user if available
    }
  };

  const closeModal = () => setIsModalOpen(false);

  // --- Delete Modal Handlers ---
  const openDeleteModal = (history: History) => {
    setHistoryToDelete(history);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setHistoryToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // --- Form Submit ---
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setHistoriesError(null);

    if (!token) {
      setHistoriesError("Authentication token not found.");
      setIsSubmitting(false);
      return;
    }

    const historyData = {
      total: total, // Use the calculated total
      items: selectedItemIds.length, // Send the *count* of selected items
      userId,
    };

    if (historyData.items === 0) {
      setHistoriesError("Please select at least one item.");
      setIsSubmitting(false);
      return;
    }

    if (!historyData.userId) {
      setHistoriesError("Please select a user.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (modalMode === "create") {
        await axios.post(
          "https://kashierapp.sendiko.my.id/api/v2/history",
          historyData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (modalMode === "update" && currentHistoryId) {
        await axios.put(
          `https://kashierapp.sendiko.my.id/api/v2/history/${currentHistoryId}`,
          historyData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      closeModal();
      await fetchHistories();
    } catch (err) {
      const error = err as AxiosError;
      console.error(`Failed to ${modalMode} history:`, error);
      setHistoriesError(
        `Failed to ${modalMode} history. ${
        // @ts-ignore
        error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete History ---
  const handleConfirmDelete = async () => {
    if (!historyToDelete) return;

    if (!token) {
      setHistoriesError("Authentication token not found.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.delete(
        `https://kashierapp.sendiko.my.id/api/v2/history/${historyToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchHistories();
      closeDeleteModal();
    } catch (err) {
      const error = err as AxiosError;
      console.error("Failed to delete history:", error);
      setHistoriesError(
        `Failed to delete history. ${
        // @ts-ignore
        error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Table Content ---
  const renderHistoriesTableContent = () => {
    if (isHistoriesLoading) {
      return (
        <tr>
          <td colSpan={6} className="py-4 text-center text-gray-500">
            Loading histories...
          </td>
        </tr>
      );
    }
    if (historiesError && histories.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="py-4 text-center text-red-500">
            {historiesError}
          </td>
        </tr>
      );
    }
    if (histories.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="py-4 text-center text-gray-500">
            No histories found.
          </td>
        </tr>
      );
    }
    return histories.map((history) => (
      <tr
        key={history.id}
        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <td className="px-6 py-4">{history.id}</td>
        <td className="px-6 py-4 font-medium">{formatCurrency(history.total)}</td>
        <td className="px-6 py-4">{history.items}</td>
        <td className="px-6 py-4">{history.userId}</td>
        <td className="px-6 py-4 text-sm text-gray-500">
          {formatDate(history.createdAt)}
        </td>
        <td className="px-6 py-4 flex gap-2 justify-end">
          <button
            onClick={() => openModal("update", history)}
            title="Edit History"
            className="p-2 rounded-full text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-gray-700 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(history)}
            title="Delete History"
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
        <h1 className="text-3xl font-semibold">Manage Histories</h1>
        <button
          onClick={() => openModal("create")}
          className="flex items-center space-x-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="whitespace-nowrap">Add New History</span>
        </button>
      </div>

      {/* Table */}
      <div className="mt-10">
        <h2 className="mb-4 text-2xl font-semibold">Recent Histories</h2>
        {historiesError && histories.length > 0 && (
          <div className="mb-4 text-red-500 text-sm">{historiesError}</div>
        )}
        <div className="overflow-x-auto rounded-lg bg-white shadow-md dark:bg-gray-800">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Created At</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>{renderHistoriesTableContent()}</tbody>
          </table>
        </div>
      </div>

      {/* Create/Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-semibold">
                {modalMode === "create" ? "Create New History" : "Update History"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4">
                {historiesError && (
                  <div className="text-red-500 text-sm">{historiesError}</div>
                )}

                {/* --- Item Selector (using MultiSelectDropdown) --- */}
                <div>
                  <label
                    htmlFor="item-selector"
                    className="block text-sm font-medium mb-1"
                  >
                    Items
                  </label>
                  <MultiSelectDropdown
                    items={availableItems}
                    selectedItemIds={selectedItemIds}
                    setSelectedItemIds={setSelectedItemIds}
                    isLoading={isAvailableItemsLoading}
                    error={availableItemsError}
                  />
                </div>

                {/* --- Total (Calculated) --- */}
                <div>
                  <label
                    htmlFor="total"
                    className="block text-sm font-medium mb-1"
                  >
                    Total (IDR)
                  </label>
                  <input
                    id="total"
                    type="text"
                    value={formatCurrency(total)}
                    disabled // Disabled as it's auto-calculated
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                  />
                </div>

                {/* --- User Selector --- */}
                <div>
                  <label
                    htmlFor="userId"
                    className="block text-sm font-medium mb-1"
                  >
                    User
                  </label>
                  <select
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    disabled={isUsersLoading}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  >
                    {isUsersLoading ? (
                      <option>Loading users...</option>
                    ) : usersError ? (
                      <option>Error loading users</option>
                    ) : (
                      <>
                        <option value="">Select a user</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div className="flex justify-end p-6 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 rounded-b-lg">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="mr-3 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : modalMode === "create"
                      ? "Create History"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && historyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex flex-col items-center p-6">
              <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
                <WarningIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-semibold mt-4">Delete History</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-center">
                Are you sure you want to delete this history record? This
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
                {isSubmitting ? "Deleting..." : "Delete History"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}