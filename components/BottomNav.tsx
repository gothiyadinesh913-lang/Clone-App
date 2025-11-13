
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Layers, Settings, HelpCircle } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/instances', label: 'Instances', icon: Layers },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/help', label: 'Help', icon: HelpCircle },
];

const BottomNav: React.FC = () => {
  const activeLinkClass = 'text-primary-500';
  const inactiveLinkClass = 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400';

  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-app-bg-light/80 dark:bg-app-bg-dark/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
      <nav className="flex justify-around items-center h-full">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center space-y-1 transition-colors duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            <Icon size={24} />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default BottomNav;
