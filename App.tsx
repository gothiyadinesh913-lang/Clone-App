

import React, { useState, useMemo, createContext, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import PhoneShell from './components/PhoneShell';
import Dashboard from './pages/Dashboard';
import MyInstances from './pages/MyInstances';
import Settings from './pages/Settings';
import Help from './pages/Help';
import toast, { Toaster } from 'react-hot-toast';
import { AppInfo, BackupData, ClonedAppInstance, ClonedAppInstanceData } from './types';
import { auth, getUserData, updateUserData, defaultUserData } from './services/firebase';
import { useMockApps } from './hooks/useMockApps';
import { LoaderCircle } from 'lucide-react';
import BackupRestoreModal from './components/BackupRestoreModal';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import { onAuthStateChanged, User } from 'firebase/auth';
import { initClient, uploadBackup } from './services/googleDrive';


interface AppContextType {
  clonedApps: ClonedAppInstance[];
  addClonedApp: (app: AppInfo, instanceName: string) => void;
  removeClonedApp: (id: string) => void;
  updateClonedApp: (id: string, newName: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  isLoading: boolean;
  isBackupModalOpen: boolean;
  setIsBackupModalOpen: (isOpen: boolean) => void;
  handleRestore: (backup: BackupData) => void;
  lastBackup: string | null;
  updateLastBackupTimestamp: () => void;
  runningInstances: { [packageName: string]: string };
  toggleInstanceState: (id: string, packageName: string, appName: string) => void;
  user: User | null;
  isAutoBackupEnabled: boolean;
  toggleAutoBackup: () => void;
  isGapiReady: boolean;
  isGoogleSignedIn: boolean;
  googleUserProfile: any;
}

export const AppContext = createContext<AppContextType | null>(null);

const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


const App: React.FC = () => {
  const [clonedAppsData, setClonedAppsData] = useState<ClonedAppInstanceData[]>([]);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [runningInstances, setRunningInstances] = useState<{ [packageName: string]: string }>({});
  const [isAutoBackupEnabled, setIsAutoBackupEnabled] = useState(false);
  const [isGapiReady, setIsGapiReady] = useState(false);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [googleUserProfile, setGoogleUserProfile] = useState<any>(null);
  const isInitialDataLoad = useRef(true);
  
  const debouncedClonedAppsData = useDebounce(clonedAppsData, 5000);

  const mockApps = useMockApps();
  const mockAppsMap = useMemo(() => new Map(mockApps.map(app => [app.packageName, app])), [mockApps]);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      isInitialDataLoad.current = true;
      try {
        if (currentUser) {
          setUser(currentUser);
          const userData = await getUserData(currentUser.uid);
          if (userData) {
            setClonedAppsData(userData.clonedApps || []);
            // FIX: Ensure theme from DB is of type 'light' | 'dark' to prevent type errors.
            setThemeState(userData.settings?.theme === 'dark' ? 'dark' : 'light');
            setLastBackup(userData.settings?.lastBackup || null);
            setIsAutoBackupEnabled(userData.settings?.isAutoBackupEnabled || false);
          } else {
            // If the user is authenticated but has no data in Firestore, create their document.
            console.warn(`No user data found for ${currentUser.uid}, creating document with default data.`);
            await updateUserData(currentUser.uid, defaultUserData);
            setClonedAppsData(defaultUserData.clonedApps);
            // FIX: Ensure theme from default user data is of type 'light' | 'dark' to prevent type errors.
            setThemeState(defaultUserData.settings.theme === 'dark' ? 'dark' : 'light');
            setLastBackup(defaultUserData.settings.lastBackup);
            setIsAutoBackupEnabled(defaultUserData.settings.isAutoBackupEnabled);
          }
        } else {
          setUser(null);
          // Reset state when user logs out
          setClonedAppsData([]);
          setThemeState('light');
          setLastBackup(null);
          setIsAutoBackupEnabled(false);
        }
      } catch (error) {
          console.error("Failed to process auth state change:", error);
          toast.error("Could not load your data. Using a temporary session.");
          // Keep user logged in, but with a temporary local session state.
          // Data saving will fail until the connection is restored, and the user will be notified by toasts.
          setClonedAppsData([]);
          setThemeState('light');
          setLastBackup(null);
          setIsAutoBackupEnabled(false);
      } finally {
          setIsLoading(false);
          setTimeout(() => isInitialDataLoad.current = false, 500); // Mark initial load as complete
      }
    });
    
    // Initialize Google Drive client
    initClient((ready, signedIn, profile) => {
        setIsGapiReady(ready);
        setIsGoogleSignedIn(signedIn);
        setGoogleUserProfile(profile);
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
  
  // Effect for automatic backup
  useEffect(() => {
    if (isInitialDataLoad.current || !isAutoBackupEnabled || !isGoogleSignedIn) {
        return;
    }
    
    const performAutoBackup = async () => {
        console.log("Performing automatic backup...");
        const backupData = {
            clonedApps: clonedAppsData,
            settings: { theme, isAutoBackupEnabled },
            backupDate: new Date().toISOString(),
        };
        try {
            await uploadBackup(JSON.stringify(backupData, null, 2));
            updateLastBackupTimestamp();
            toast.success('Data automatically backed up', { id: 'auto-backup-toast' });
        } catch (error) {
            console.error("Auto-backup failed:", error);
            toast.error('Automatic backup failed.', { id: 'auto-backup-toast' });
        }
    };
    
    performAutoBackup();

  }, [debouncedClonedAppsData, theme, isAutoBackupEnabled]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    if (user) {
      updateUserData(user.uid, { 'settings.theme': newTheme });
    }
  };
  
  const toggleAutoBackup = () => {
    const newState = !isAutoBackupEnabled;
    setIsAutoBackupEnabled(newState);
    if (user) {
      updateUserData(user.uid, { 'settings.isAutoBackupEnabled': newState });
    }
  };

  const updateLastBackupTimestamp = () => {
    const timestamp = new Date().toISOString();
    setLastBackup(timestamp);
    if(user) {
      updateUserData(user.uid, { 'settings.lastBackup': timestamp });
    }
  }

  const handleRestore = (backup: BackupData) => {
    setClonedAppsData(backup.clonedApps);
    setThemeState(backup.settings.theme);
    setIsAutoBackupEnabled(backup.settings.isAutoBackupEnabled || false);
    setRunningInstances({}); // Reset running state on restore
    if(user) {
      updateUserData(user.uid, { 
        clonedApps: backup.clonedApps,
        'settings.theme': backup.settings.theme,
        'settings.isAutoBackupEnabled': backup.settings.isAutoBackupEnabled || false,
      });
    }
  };

  const toggleInstanceState = (id: string, packageName: string, appName: string) => {
    setRunningInstances(prev => {
      const currentRunningId = prev[packageName];
      if (currentRunningId === id) {
        // Stop the current instance
        const { [packageName]: _, ...rest } = prev;
        toast.success(`${appName} stopped.`);
        return rest;
      } else if (currentRunningId) {
        // Another instance of the same app is running
        toast.error(`Another instance of ${mockAppsMap.get(packageName)?.name} is running. Please stop it first.`);
        return prev;
      } else {
        // Start this instance
        toast.success(`Launching ${appName}...`);
        return { ...prev, [packageName]: id };
      }
    });
  };

  const appContextValue = useMemo(() => {
    const clonedApps: ClonedAppInstance[] = clonedAppsData
      .map(data => {
        const appInfo = mockAppsMap.get(data.packageName);
        return { ...appInfo!, ...data };
      })
      .filter(app => app.name); // Filter out any that didn't find a match

    return {
      clonedApps,
      isLoading,
      addClonedApp: (app: AppInfo, instanceName: string) => {
        const originalSize = parseInt(app.size.split(' ')[0]);
        const newSize = originalSize + Math.floor(Math.random() * 50) + 10;
        const batteryLevels: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];

        const newCloneData: ClonedAppInstanceData = {
          packageName: app.packageName,
          id: `${app.packageName}-${Date.now()}`,
          instanceName: instanceName,
          clonedAt: new Date().toISOString(),
          storageUsed: `${newSize} MB`,
          batteryUsage: batteryLevels[Math.floor(Math.random() * batteryLevels.length)],
        };
        
        const newClonedAppsData = [...clonedAppsData, newCloneData];
        setClonedAppsData(newClonedAppsData);
        if(user) {
          updateUserData(user.uid, { clonedApps: newClonedAppsData });
        }
      },
      removeClonedApp: (id: string) => {
        // Stop the app if it's running before deleting
        const appToRemove = clonedAppsData.find(app => app.id === id);
        if (appToRemove && runningInstances[appToRemove.packageName] === id) {
          setRunningInstances(prev => {
            const { [appToRemove.packageName]: _, ...rest } = prev;
            return rest;
          });
        }

        const newClonedAppsData = clonedAppsData.filter(app => app.id !== id);
        setClonedAppsData(newClonedAppsData);
        if (user) {
          updateUserData(user.uid, { clonedApps: newClonedAppsData });
        }
      },
      updateClonedApp: (id: string, newName: string) => {
        const newClonedAppsData = clonedAppsData.map(app => app.id === id ? { ...app, instanceName: newName } : app);
        setClonedAppsData(newClonedAppsData);
        if (user) {
          updateUserData(user.uid, { clonedApps: newClonedAppsData });
        }
      },
      theme,
      setTheme,
      isBackupModalOpen,
      setIsBackupModalOpen,
      handleRestore,
      lastBackup,
      updateLastBackupTimestamp,
      runningInstances,
      toggleInstanceState,
      user,
      isAutoBackupEnabled,
      toggleAutoBackup,
      isGapiReady,
      isGoogleSignedIn,
      googleUserProfile,
    };
  }, [clonedAppsData, theme, user, isLoading, mockAppsMap, isBackupModalOpen, lastBackup, runningInstances, isAutoBackupEnabled, isGapiReady, isGoogleSignedIn, googleUserProfile]);
  
  const LoadingScreen = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-phone-bg-light dark:bg-phone-bg-dark text-gray-500 dark:text-gray-400">
        <LoaderCircle size={48} className="animate-spin mb-4 text-primary-500" />
        <p>Loading session...</p>
    </div>
  );

  const MainAppRoutes = () => (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/instances" element={<MyInstances />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );

  const AuthRoutes = () => (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );


  return (
    <AppContext.Provider value={appContextValue}>
      <HashRouter>
        <div className="min-h-screen flex items-center justify-center font-sans">
          <PhoneShell showNav={!!user}>
            {isLoading ? <LoadingScreen/> : (user ? <MainAppRoutes /> : <AuthRoutes />)}
          </PhoneShell>
          <Toaster position="bottom-center" toastOptions={{
            className: 'dark:bg-gray-700 dark:text-white',
          }}/>
          {user && <BackupRestoreModal />}
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
