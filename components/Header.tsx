
import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, children }) => {
  return (
    <div className="px-4 py-3 sticky top-0 bg-app-bg-light/80 dark:bg-app-bg-dark/80 backdrop-blur-sm z-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Header;
