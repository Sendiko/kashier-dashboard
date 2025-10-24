import React, { useState, useRef, useEffect } from 'react';

// Re-using formatCurrency from your page for consistency
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

interface Item {
  id: number;
  name: string;
  price: number;
}

interface MultiSelectDropdownProps {
  items: Item[];
  selectedItemIds: string[];
  setSelectedItemIds: (ids: string[]) => void;
  isLoading?: boolean;
  error?: string | null;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  items,
  selectedItemIds = [], // Default to an empty array to prevent map error
  setSelectedItemIds,
  isLoading,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedItems = selectedItemIds.map(id => items.find(item => String(item.id) === id)).filter(Boolean) as Item[];

  const handleToggle = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) { // If opening, focus the input
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleSelect = (itemId: string) => {
    // @ts-ignore
    setSelectedItemIds(prev => {
      if (prev.includes(itemId)) {
        // @ts-ignore
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
    setSearchTerm(''); // Clear search after selection
    inputRef.current?.focus(); // Keep focus on the input
  };

  const handleRemoveTag = (itemId: string) => {
    // @ts-ignore
    setSelectedItemIds(prev => prev.filter(id => id !== itemId));
    inputRef.current?.focus();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex flex-wrap items-center w-full min-h-[42px] px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 cursor-pointer focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all duration-200"
        onClick={handleToggle}
      >
        {selectedItems.map(item => (
          <span
            key={item.id}
            className="flex items-center bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-200 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 mb-1 mt-1"
            onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking tag
          >
            {item.name}
            <button
              type="button"
              onClick={() => handleRemoveTag(String(item.id))}
              className="ml-1 -mr-0.5 text-indigo-400 dark:text-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-100 focus:outline-none"
            >
              <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="flex-grow bg-transparent border-none focus:ring-0 focus:outline-none dark:text-white placeholder-gray-400 dark:placeholder-gray-300 min-w-[50px] py-0.5 mb-1 mt-1"
          placeholder={selectedItems.length === 0 ? "Select items..." : ""}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        <span className="text-gray-500 dark:text-gray-400 text-sm ml-auto mr-2">
            {selectedItems.length > 0 ? `+ ${selectedItems.length} items selected` : ''}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-2 text-gray-500 dark:text-gray-400">Loading items...</div>
          ) : error ? (
            <div className="px-4 py-2 text-red-500 dark:text-red-400">{error}</div>
          ) : filteredItems.length === 0 ? (
            <div className="px-4 py-2 text-gray-500 dark:text-gray-400">No items found.</div>
          ) : (
            <ul>
              {filteredItems.map(item => (
                <li
                  key={item.id}
                  onClick={() => handleSelect(String(item.id))}
                  className={`px-4 py-2 cursor-pointer hover:bg-indigo-500 hover:text-white transition-colors duration-150 ${
                    selectedItemIds.includes(String(item.id))
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {item.name} - {formatCurrency(item.price)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;