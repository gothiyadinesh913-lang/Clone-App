
import React from 'react';
import { AppInfo } from '../types';
import { PlusCircle } from 'lucide-react';

interface AppListItemProps {
  app: AppInfo;
  onClone: () => void;
}

const AppListItem: React.FC<AppListItemProps> = ({ app, onClone }) => {
  return (
    <div className="flex items-center p-3 bg-app-bg-light dark:bg-app-bg-dark rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
      <app.icon className="w-12 h-12 mr-4" />
      <div className="flex-grow">
        <p className="font-semibold text-gray-800 dark:text-gray-100">{app.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{app.packageName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Size: {app.size}</p>
      </div>
      <button 
        onClick={onClone}
        className="flex items-center justify-center gap-2 px-3 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors duration-200 text-sm font-semibold"
      >
        <PlusCircle size={18} />
        <span>Clone</span>
      </button>
    </div>
  );
};

export default AppListItem;
