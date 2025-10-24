"use client";

import { useState, useEffect, FormEvent } from "react";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

// --- Types ---
interface Item {
  id: number;
  name: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
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

// New Pencil Icon
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

// New Trash Icon
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

// New Warning Icon for delete modal
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

export default function ItemsPage() {
  // --- States ---
  const [items, setItems] = useState<Item[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  const [currentItemId, setCurrentItemId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [userId, setUserId] = useState("");

  const token = Cookies.get("kashier-token");

  // --- Fetch Items ---
  const fetchItems = async () => {
    setIsItemsLoading(true);
    setItemsError(null);
    try {
      const response = await axios.get(
        "https://kashierapp.sendiko.my.id/api/v2/item",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data && Array.isArray(response.data.items)) {
        setItems(response.data.items);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to fetch items:", err);
      let msg = "Failed to fetch items.";
      if (axios.isAxiosError(err)) {
        // @ts-ignore
        msg = err.response?.data?.message || err.message;
      }
      setItemsError(msg);
    } finally {
      setIsItemsLoading(false);
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
      // Fixed API version from v1 to v2
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
    if (token) {
      fetchItems();
      fetchUsers();
    } else {
      setItemsError("Authentication token not found.");
      setUsersError("Authentication token not found.");
      setIsItemsLoading(false);
      setIsUsersLoading(false);
    }
  }, []);

  // --- Modal Handling ---
  const openModal = (mode: ModalMode, item: Item | null = null) => {
    setIsModalOpen(true);
    setModalMode(mode);
    setIsSubmitting(false);
    setItemsError(null);

    if (mode === "update" && item) {
      setCurrentItemId(item.id);
      setName(item.name);
      setPrice(String(item.price));
      setUserId(item.userId);
    } else {
      setCurrentItemId(null);
      setName("");
      setPrice("");
      setUserId(users.length > 0 ? users[0].id : "");
    }
  };

  const closeModal = () => setIsModalOpen(false);

  // --- Delete Modal Handlers ---
  const openDeleteModal = (item: Item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setItemToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // --- Form Submit ---
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setItemsError(null);

    if (!token) {
      setItemsError("Authentication token not found.");
      setIsSubmitting(false);
      return;
    }

    const itemData = {
      name,
      price: parseInt(price, 10),
      userId,
    };

    if (isNaN(itemData.price)) {
      setItemsError("Price must be a valid number.");
      setIsSubmitting(false);
      return;
    }

    if (!itemData.userId) {
      setItemsError("Please select a user.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (modalMode === "create") {
        await axios.post(
          "https://kashierapp.sendiko.my.id/api/v2/item",
          itemData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (modalMode === "update" && currentItemId) {
        await axios.put(
          `https://kashierapp.sendiko.my.id/api/v2/item/${currentItemId}`,
          itemData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      closeModal();
      await fetchItems();
    } catch (err) {
      const error = err as AxiosError;
      console.error(`Failed to ${modalMode} item:`, error);
      setItemsError(
        `Failed to ${modalMode} item. ${
          // @ts-ignore
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete Item ---
  // This now confirms the delete from the modal
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    if (!token) {
      setItemsError("Authentication token not found.");
      return;
    }

    setIsSubmitting(true); // Re-use submitting state for delete modal
    try {
      await axios.delete(
        `https://kashierapp.sendiko.my.id/api/v2/item/${itemToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchItems();
      closeDeleteModal();
    } catch (err) {
      const error = err as AxiosError;
      console.error("Failed to delete item:", error);
      setItemsError(
        `Failed to delete item. ${
          // @ts-ignore
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Table Content ---
  const renderItemsTableContent = () => {
    if (isItemsLoading) {
      return (
        <tr>
          <td colSpan={6} className="py-4 text-center text-gray-500">
            Loading items...
          </td>
        </tr>
      );
    }
    if (itemsError && items.length === 0) { // Only show error if no items are present
      return (
        <tr>
          <td colSpan={6} className="py-4 text-center text-red-500">
            {itemsError}
          </td>
        </tr>
      );
    }
    if (items.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="py-4 text-center text-gray-500">
            No items found.
          </td>
        </tr>
      );
    }
    return items.map((item) => (
      <tr
        key={item.id}
        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <td className="px-6 py-4">{item.id}</td>
        <td className="px-6 py-4 font-medium">{item.name}</td>
        <td className="px-6 py-4">{formatCurrency(item.price)}</td>
        <td className="px-6 py-4">{item.userId}</td>
        <td className="px-6 py-4 text-sm text-gray-500">
          {formatDate(item.createdAt)}
        </td>
        <td className="px-6 py-4 flex gap-2 justify-end">
          {/* Updated Edit Button */}
          <button
            onClick={() => openModal("update", item)}
            title="Edit Item"
            className="p-2 rounded-full text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-gray-700 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          {/* Updated Delete Button */}
          <button
            onClick={() => openDeleteModal(item)}
            title="Delete Item"
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
        <h1 className="text-3xl font-semibold">Manage Items</h1>
        <button
          onClick={() => openModal("create")}
          className="flex items-center space-x-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="whitespace-nowrap">Add New Item</span>
        </button>
      </div>

      {/* Table */}
      <div className="mt-10">
        {/* Show table-related errors right above the table */}
        {itemsError && items.length > 0 && (
           <div className="mb-4 text-red-500 text-sm">{itemsError}</div>
        )}
        <div className="overflow-x-auto rounded-lg bg-white shadow-md dark:bg-gray-800">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Created At</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>{renderItemsTableContent()}</tbody>
          </table>
        </div>
      </div>

      {/* Create/Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-semibold">
                {modalMode === "create" ? "Create New Item" : "Update Item"}
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
                {itemsError && (
                  <div className="text-red-500 text-sm">{itemsError}</div>
                )}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-1"
                  >
                    Item Name
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium mb-1"
                  >
                    Price (IDR)
                  </label>
                  <input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                  />
                </div>
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
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
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
                  className="mr-3 px-4 py-2 bg-white dark:bg-gray-700 border rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
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
                    ? "Create Item"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Delete Confirmation Modal */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex flex-col items-center p-6">
              <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
                <WarningIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-semibold mt-4">Delete Item</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-center">
                Are you sure you want to delete item "{itemToDelete.name}"? This
                action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end p-6 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 rounded-b-lg">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isSubmitting}
                className="mr-3 px-4 py-2 bg-white dark:bg-gray-700 border rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Delete Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}