import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { CloudUpload, CloudDownload, X, LoaderCircle, LogIn, LogOut } from 'lucide-react';
import { handleAuthClick, handleSignoutClick, uploadBackup, getBackupContent } from '../services/googleDrive';
import toast from 'react-hot-toast';

const BackupRestoreModal: React.FC = () => {
    const context = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(false);

    if (!context) return null;
    const { 
        isBackupModalOpen, 
        setIsBackupModalOpen, 
        clonedApps, 
        theme, 
        handleRestore, 
        lastBackup, 
        updateLastBackupTimestamp,
        isGapiReady,
        isGoogleSignedIn,
        googleUserProfile,
        isAutoBackupEnabled,
    } = context;

    const handleBackup = async () => {
        setIsLoading(true);
        const toastId = toast.loading('Backing up data...');
        try {
            const backupData = {
                clonedApps: clonedApps.map(({ name, icon, size, isBankingApp, ...data }) => data), // strip appinfo
                settings: { theme, isAutoBackupEnabled },
                backupDate: new Date().toISOString(),
            };
            await uploadBackup(JSON.stringify(backupData, null, 2));
            updateLastBackupTimestamp();
            toast.success('Backup successful!', { id: toastId });
        } catch (error) {
            console.error('Backup failed:', error);
            toast.error('Backup failed. Please try again.', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestoreConfirm = async () => {
        setIsLoading(true);
        const toastId = toast.loading('Searching for backup...');
        try {
            const fileContent = await getBackupContent();
            if (!fileContent) {
                toast.error('No backup file found.', { id: toastId });
                setIsLoading(false);
                return;
            }
            
            toast.dismiss(toastId);
            
            // Using a native confirm dialog for simplicity
            const confirmation = window.confirm(
                'Are you sure you want to restore? This will overwrite all your current cloned apps and settings.'
            );

            if (confirmation) {
                const restoreToastId = toast.loading('Restoring data...');
                try {
                    const backupData = JSON.parse(fileContent);
                    handleRestore(backupData);
                    toast.success('Restore successful!', { id: restoreToastId });
                    setIsBackupModalOpen(false);
                } catch(parseError) {
                     console.error('Restore failed during parse:', parseError);
                    toast.error('Restore failed. The backup file might be corrupted.', { id: restoreToastId });
                }
            }
        } catch (error) {
            console.error('Restore failed:', error);
            toast.error('Restore failed. Could not access backup file.', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isBackupModalOpen) return null;

    const ActionButton = ({ icon: Icon, text, onClick, disabled }: { icon: React.ElementType, text: string, onClick: () => void, disabled?: boolean }) => (
        <button
            onClick={onClick}
            disabled={disabled || isLoading}
            className="flex items-center justify-center w-full px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            {isLoading ? <LoaderCircle className="animate-spin mr-2" size={20} /> : <Icon className="mr-2" size={20} />}
            <span className="font-semibold">{text}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsBackupModalOpen(false)}>
            <div className="relative w-full max-w-sm bg-app-bg-light dark:bg-app-bg-dark rounded-2xl shadow-lg p-6" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setIsBackupModalOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X size={24} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Backup & Restore</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Use your Google Account to save and load your data.</p>

                {!isGapiReady && <div className="text-center text-gray-500"><LoaderCircle className="animate-spin inline-block" /></div>}

                {isGapiReady && (
                    <>
                        {isGoogleSignedIn && googleUserProfile ? (
                            <div className="text-center mb-6">
                                <div className="flex items-center justify-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <img src={googleUserProfile.picture} alt="profile" className="w-10 h-10 rounded-full" />
                                    <div className="text-left">
                                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{googleUserProfile.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{googleUserProfile.email}</p>
                                    </div>
                                    <button onClick={handleSignoutClick} title="Sign Out" className="ml-auto p-2 text-gray-500 hover:text-red-500">
                                        <LogOut size={20} />
                                    </button>
                                </div>
                                {lastBackup && <p className="text-xs text-gray-400 mt-2">Last backup: {new Date(lastBackup).toLocaleString()}</p>}
                            </div>
                        ) : (
                            <button
                                onClick={handleAuthClick}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 mb-6"
                            >
                                <LogIn size={20} />
                                <span className="text-sm font-semibold">Sign in with Google</span>
                            </button>
                        )}

                        <div className="space-y-3">
                            <ActionButton icon={CloudUpload} text="Backup Now" onClick={handleBackup} disabled={!isGoogleSignedIn} />
                            <ActionButton icon={CloudDownload} text="Restore from Drive" onClick={handleRestoreConfirm} disabled={!isGoogleSignedIn} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BackupRestoreModal;