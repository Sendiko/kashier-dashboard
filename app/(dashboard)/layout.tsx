"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

// --- SVG Icons ---
const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
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

const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
// --- End SVG Icons ---

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pathname = usePathname(); // current route

  const baseLinkClasses =
    "flex items-center space-x-3 rounded-lg px-4 py-2 transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";

  const activeClasses =
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-700/30 dark:text-indigo-300 font-semibold";

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/items", label: "Items" },
    { href: "/histories", label: "Histories" },
    { href: "/users", label: "Users" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* --- Sidebar --- */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 bg-white dark:bg-gray-800 shadow-md
          transition-all duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          ${isSidebarOpen ? "w-64" : "w-20"}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div
            className={`flex items-center p-6 ${
              isSidebarOpen ? "justify-between" : "justify-center"
            }`}
          >
            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 overflow-hidden">
              <span className={!isSidebarOpen ? "hidden" : "block"}>Kashier</span>
              <span className={isSidebarOpen ? "hidden" : "block"}>K</span>
            </h1>
            <button
              className="md:hidden text-gray-700 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2">
            <ul className="space-y-4">
              {links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className={`
                        ${baseLinkClasses}
                        ${isActive ? activeClasses : ""}
                        ${!isSidebarOpen && "justify-center"}
                      `}
                    >
                      {/* You can add icons here */}
                      <span
                        className={`transition-opacity ${
                          !isSidebarOpen
                            ? "opacity-0 md:hidden"
                            : "opacity-100"
                        }`}
                      >
                        {link.label}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4">
            <a
              href="/login"
              className={`
                mt-8 block rounded-lg px-4 py-2 text-center font-medium text-red-700 bg-red-100 hover:bg-red-200 
                dark:text-red-300 dark:bg-red-800/50 dark:hover:bg-red-700/50 
                transition-all duration-200 ease-in-out
                ${!isSidebarOpen && "text-sm"}
              `}
            >
              <span
                className={`transition-opacity ${
                  !isSidebarOpen ? "opacity-0 md:hidden" : "opacity-100"
                }`}
              >
                Logout
              </span>
            </a>
          </div>

          {/* Desktop Toggle */}
          <div className="hidden md:flex justify-center p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <ChevronLeftIcon
                className={`transition-transform duration-300 ${
                  !isSidebarOpen && "rotate-180"
                }`}
              />
            </button>
          </div>
        </div>
      </aside>

      {/* --- Mobile Backdrop --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* --- Main Content Area --- */}
      <div
        className={`
        flex flex-1 flex-col 
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "md:ml-64" : "md:ml-20"}
      `}
      >
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md md:hidden">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Kashier</h1>
          <button
            className="text-gray-700 dark:text-gray-300"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <MenuIcon />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
