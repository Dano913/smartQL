// components/Layout.tsx
import React from 'react';
import { Box } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
  showReset?: boolean;
  onReset?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, showReset, onReset }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex flex-col transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm py-4 overflow-hidden whitespace-nowrap">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 w-[10%]">
            <Box className="h-6 w-6 text-blue-500" />
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              <strong>Smart</strong>QL
            </h1>
          </div>
          <ThemeToggle />
          {showReset && onReset && (
            <button
              onClick={onReset}
              className="px-3 py-1 w-[10%] text-sm text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors overflow-hidden whitespace-nowrap"
            >
              New Document
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>

      <footer className="bg-white dark:bg-gray-800 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            <strong>Smart</strong>QL &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
