
import React, { useContext } from 'react';
import { AppContext } from '../App';
import { useMockApps } from '../hooks/useMockApps';
import AppListItem from '../components/AppListItem';
import Header from '../components/Header';
import toast from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const context = useContext(AppContext);
  const installedApps = useMockApps();

  const handleClone = (app: (typeof installedApps)[0]) => {
    if (app.isBankingApp) {
      toast(
        (t) => (
          <div className="flex items-start">
            <AlertCircle className="text-yellow-500 w-8 h-8 mr-3" />
            <div className="flex-grow">
              <p className="font-bold">Warning</p>
              <p className="text-sm">
                Apps like '{app.name}' have security features that may prevent them from working correctly when cloned. Do you want to proceed?
              </p>
              <div className="mt-2 text-right">
                <button 
                    onClick={() => {
                        performClone(app);
                        toast.dismiss(t.id);
                    }}
                    className="px-3 py-1 bg-primary-500 text-white rounded text-sm mr-2"
                >
                    Proceed
                </button>
                <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm">
                    Cancel
                </button>
              </div>
            </div>
          </div>
        ), {
          duration: 10000,
        }
      );
    } else {
      performClone(app);
    }
  };

  const performClone = (app: (typeof installedApps)[0]) => {
    if (context) {
      const existingClones = context.clonedApps.filter(clonedApp => clonedApp.packageName === app.packageName);
      const instanceName = `${app.name} (${existingClones.length + 1})`;
      context.addClonedApp(app, instanceName);
      toast.success(`${instanceName} created!`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="App Cloner" subtitle="Select an app to create a copy" />
      <div className="p-4 space-y-3 flex-grow">
        {installedApps.map(app => (
          <AppListItem key={app.packageName} app={app} onClone={() => handleClone(app)} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
