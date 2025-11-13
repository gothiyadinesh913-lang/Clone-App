
import React, { useContext } from 'react';
import { AppContext } from '../App';
import Header from '../components/Header';
import ClonedInstanceItem from '../components/ClonedInstanceItem';
import { Layers } from 'lucide-react';

const MyInstances: React.FC = () => {
  const context = useContext(AppContext);
  const clonedApps = context ? context.clonedApps : [];

  return (
    <div className="flex flex-col h-full">
      <Header title="My Instances" subtitle={`${clonedApps.length} cloned app${clonedApps.length !== 1 ? 's' : ''}`} />
      <div className="p-4 space-y-3 flex-grow">
        {clonedApps.length > 0 ? (
          clonedApps.map(instance => (
            <ClonedInstanceItem key={instance.id} instance={instance} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-full text-gray-500 dark:text-gray-400">
            <Layers size={48} className="mb-4" />
            <h2 className="text-xl font-semibold">No Cloned Apps</h2>
            <p className="mt-1">Go to the Dashboard to clone your first app.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInstances;
