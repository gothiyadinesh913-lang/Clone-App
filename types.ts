export interface AppInfo {
    name: string;
    packageName: string;
    icon: React.ComponentType<{ className?: string }>;
    size: string;
    isBankingApp?: boolean;
}

export interface ClonedAppInstanceData {
    id: string;
    packageName: string;
    instanceName: string;
    clonedAt: string;
    storageUsed: string;
    batteryUsage: 'Low' | 'Medium' | 'High';
}

export interface ClonedAppInstance extends AppInfo, ClonedAppInstanceData {}

export interface BackupData {
    clonedApps: ClonedAppInstanceData[];
    settings: {
        theme: 'light' | 'dark';
        isAutoBackupEnabled?: boolean;
    };
    backupDate: string;
}

export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}