
import React, { useContext, useState } from 'react';
import Header from '../components/Header';
import { Moon, Sun, Lock, Bell, Star, FileText, Cloud, LogOut, User as UserIcon, CloudCog } from 'lucide-react';
import { AppContext } from '../App';
import { signOutUser } from '../services/firebase';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const context = useContext(AppContext);
  const [appLock, setAppLock] = useState(false);
  const [notifications, setNotifications] = useState(true);

  if (!context) return null;

  const { 
    theme, 
    setTheme, 
    setIsBackupModalOpen, 
    user,
    isAutoBackupEnabled,
    toggleAutoBackup,
    isGoogleSignedIn,
  } = context;

  const handleThemeChange = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast.success("Signed out successfully.");
    } catch (error) {
      toast.error("Failed to sign out.");
    }
  };

  const SettingRow = ({ icon: Icon, title, subtitle, children, onClick, isDisabled = false }: { icon: React.ElementType, title: string, subtitle: string, children?: React.ReactNode, onClick?: () => void, isDisabled?: boolean }) => (
    <div 
      className={`flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 ${onClick && !isDisabled ? 'cursor-pointer' : ''} ${isDisabled ? 'opacity-50' : ''}`}
      onClick={!isDisabled ? onClick : undefined}
    >
        <div className="flex items-center">
            <Icon className="w-6 h-6 mr-4 text-primary-500" />
            <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            </div>
        </div>
        <div>
            {children}
        </div>
    </div>
  );

  const ToggleSwitch = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: () => void, disabled?: boolean }) => (
    <button onClick={onChange} disabled={disabled} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'} ${disabled ? 'cursor-not-allowed' : ''}`}>
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" subtitle="Configure your preferences" />
      <div className="p-4 flex-grow">
          {user && (
            <div className="flex items-center p-3 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <UserIcon className="w-8 h-8 mr-3 text-primary-500"/>
                <div>
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">Logged in as</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{user.email}</p>
                </div>
            </div>
          )}

          <SettingRow icon={theme === 'dark' ? Moon : Sun} title="Appearance" subtitle={`Currently ${theme} mode`}>
              <ToggleSwitch checked={theme === 'dark'} onChange={handleThemeChange} />
          </SettingRow>
          <SettingRow icon={Lock} title="App Lock" subtitle={appLock ? "Enabled" : "Disabled"}>
              <ToggleSwitch checked={appLock} onChange={() => setAppLock(!appLock)} />
          </SettingRow>
           <SettingRow icon={Bell} title="Notifications" subtitle={notifications ? "Enabled" : "Disabled"}>
              <ToggleSwitch checked={notifications} onChange={() => setNotifications(!notifications)} />
          </SettingRow>
          <SettingRow 
            icon={Cloud} 
            title="Backup & Restore" 
            subtitle="Manual sync with Google Drive"
            onClick={() => setIsBackupModalOpen(true)}
          >
            <span className="text-gray-400 text-sm">&gt;</span>
          </SettingRow>
           <SettingRow 
            icon={CloudCog} 
            title="Automatic Cloud Backup" 
            subtitle={isGoogleSignedIn ? (isAutoBackupEnabled ? "Enabled" : "Disabled") : "Sign in to Google to enable"}
            isDisabled={!isGoogleSignedIn}
          >
              <ToggleSwitch checked={isAutoBackupEnabled} onChange={toggleAutoBackup} disabled={!isGoogleSignedIn} />
          </SettingRow>
          <SettingRow icon={Star} title="Upgrade to Pro" subtitle="Unlimited clones & no ads">
              <button className="px-3 py-1 text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/50 rounded-full">Upgrade</button>
          </SettingRow>
          <SettingRow icon={FileText} title="Privacy Policy" subtitle="Read our data handling policy">
              <span className="text-gray-400 text-sm">&gt;</span>
          </SettingRow>
           <SettingRow 
            icon={LogOut} 
            title="Sign Out" 
            subtitle="End your current session"
            onClick={handleSignOut}
          >
            <span className="text-gray-400 text-sm">&gt;</span>
          </SettingRow>
      </div>
    </div>
  );
};

export default Settings;