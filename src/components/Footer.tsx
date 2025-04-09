
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 py-10 border-t border-gray-200 dark:border-gray-800">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="font-pacifico text-2xl bg-gradient-to-r from-brasil-green via-brasil-yellow to-brasil-blue bg-clip-text text-transparent">
              Olá Mundo!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Connecting cultures through technology
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-brasil-green transition-colors dark:text-gray-400 dark:hover:text-brasil-yellow">
              About
            </a>
            <a href="#" className="text-gray-600 hover:text-brasil-green transition-colors dark:text-gray-400 dark:hover:text-brasil-yellow">
              Features
            </a>
            <a href="#" className="text-gray-600 hover:text-brasil-green transition-colors dark:text-gray-400 dark:hover:text-brasil-yellow">
              Contact
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Olá Mundo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
