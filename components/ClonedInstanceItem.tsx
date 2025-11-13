import React, { useState, useContext } from 'react';
import { ClonedAppInstance } from '../types';
import { Play, MoreVertical, Edit, Trash2, ChevronDown, Calendar, HardDrive, Battery, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppContext } from '../App';

interface ClonedInstanceItemProps {
  instance: ClonedAppInstance;
}

const ClonedInstanceItem: React.FC<ClonedInstanceItemProps> = ({ instance }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(instance.instanceName);
  const [isExpanded, setIsExpanded] = useState(false);
  const context = useContext(AppContext);

  if (!context) return null;
  const { runningInstances, toggleInstanceState } = context;
  const isRunning = runningInstances[instance.packageName] === instance.id;
  const anotherIsRunning = runningInstances[instance.packageName] && runningInstances[instance.packageName] !== instance.id;


  const handleRename = () => {
    if (newName.trim() && context) {
      context.updateClonedApp(instance.id, newName.trim());
      toast.success(`Renamed to ${newName.trim()}`);
    }
    setIsEditing(false);
    setMenuOpen(false);
  };
  
  const handleDelete = () => {
    if (context) {
      context.removeClonedApp(instance.id);
      toast.error(`${instance.instanceName} deleted`);
    }
    setMenuOpen(false);
  };

  const getBatteryColor = (usage: 'Low' | 'Medium' | 'High') => {
    switch (usage) {
      case 'Low': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'High': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const renderStorageUsage = () => {
    const storageValue = parseInt(instance.storageUsed);
    if (isNaN(storageValue)) {
        return (
            <div className="flex items-center">
                <HardDrive size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                <span className="font-medium mr-1">Storage Used:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{instance.storageUsed}</span>
            </div>
        );
    }

    const maxStorage = 1024; // Assume max 1GB for visualization
    const percentage = Math.min((storageValue / maxStorage) * 100, 100);

    let barColor = 'bg-green-500';
    if (percentage > 75) {
      barColor = 'bg-red-500';
    } else if (percentage > 40) {
      barColor = 'bg-yellow-500';
    }

    return (
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <HardDrive size={14} className="mr-2 text-gray-400 flex-shrink-0" />
            <span className="font-medium">Storage Used</span>
          </div>
          <span className="font-semibold text-gray-800 dark:text-gray-200">{instance.storageUsed}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 mt-1.5">
          <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    );
  };

  const handleLaunchToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleInstanceState(instance.id, instance.packageName, instance.instanceName);
  }

  return (
    <div className={`relative bg-app-bg-light dark:bg-app-bg-dark rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${isRunning ? 'ring-2 ring-green-500 shadow-lg' : ''}`}>
      <div 
        className="flex items-center p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        aria-expanded={isExpanded}
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsExpanded(!isExpanded)}
      >
        <instance.icon className="w-12 h-12 mr-4 flex-shrink-0" />
        <div className="flex-grow min-w-0">
          {isEditing ? (
            <input 
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold p-1 rounded"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{instance.instanceName}</p>
              {isRunning && (
                <div className="flex-shrink-0 flex items-center gap-1.5 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">Running</span>
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{instance.name}</p>
        </div>
        
        <div className="flex items-center flex-shrink-0 ml-2 z-10" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={handleLaunchToggle}
            disabled={anotherIsRunning}
            className={`flex items-center justify-center p-2 text-white rounded-full transition-colors duration-200 mr-2
              ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
              ${anotherIsRunning ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : ''}
            `}
            aria-label={isRunning ? `Stop ${instance.instanceName}` : `Launch ${instance.instanceName}`}
          >
            {isRunning ? <Square size={20} /> : <Play size={20} />}
          </button>
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              aria-label="More options"
            >
              <MoreVertical size={20} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                <button onClick={() => { setIsEditing(true); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Edit size={16} className="mr-2" /> Rename
                </button>
                <button onClick={handleDelete} className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Trash2 size={16} className="mr-2" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
        
        <ChevronDown size={20} className={`ml-2 text-gray-400 transform transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      <div className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-40' : 'max-h-0'}`}>
        <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Instance Details</h4>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar size={14} className="mr-2 text-gray-400 flex-shrink-0" />
              <span className="font-medium mr-1">Cloned:</span>
              <span>{new Date(instance.clonedAt).toLocaleDateString()}</span>
            </div>
            {renderStorageUsage()}
            <div className="flex items-center">
              <Battery size={14} className="mr-2 text-gray-400 flex-shrink-0" />
              <span className="font-medium mr-1">Battery:</span>
              <span className={`font-semibold ${getBatteryColor(instance.batteryUsage)}`}>
                {instance.batteryUsage}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClonedInstanceItem;