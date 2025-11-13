// @ts-nocheck

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // IMPORTANT: Replace with your Google Client ID
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const BACKUP_FILE_NAME = 'app-cloner-backup.json';

let gapi = window.gapi;
let google = window.google;
let tokenClient;
let onStateChangeCallback;
let googleDriveEnabled = false;

// --- Mock In-Memory Storage ---
let mockIsSignedIn = false;
let mockUserProfile = null;
let mockBackupContent = null;
// --- End Mock ---


export const initClient = (callback) => {
    onStateChangeCallback = callback;
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => gapi.load('client', gapiLoaded);
    document.body.appendChild(script);

    const scriptGsi = document.createElement('script');
    scriptGsi.src = 'https://accounts.google.com/gsi/client';
    scriptGsi.async = true;
    scriptGsi.defer = true;
    scriptGsi.onload = gsiLoaded;
    document.body.appendChild(scriptGsi);
};

async function gapiLoaded() {
    await gapi.client.init({
        // API key not needed for this flow
        // discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    });
    checkGapiReady();
}

function gsiLoaded() {
    if (CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
        console.warn("Google Drive service requires a valid Client ID. Using mock service.");
        googleDriveEnabled = false;
        checkGapiReady(); // Still need to signal readiness for mock service
        return;
    }
    googleDriveEnabled = true;
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: tokenCallback,
    });
    checkGapiReady();
}

function checkGapiReady() {
    const isReady = (gapi && gapi.client && (tokenClient || !googleDriveEnabled));
    if (isReady) {
        onStateChangeCallback(true, false, null); // Ready, not signed in, no profile
    }
}

async function tokenCallback(resp) {
    if (resp.error !== undefined) {
        throw (resp);
    }
    await updateUserProfile();
}

async function updateUserProfile() {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { 'Authorization': `Bearer ${gapi.client.getToken().access_token}` }
    });
    const profile = await response.json();
    onStateChangeCallback(true, true, profile);
}

export const handleAuthClick = () => {
    if (!googleDriveEnabled) {
        // Mock Auth
        mockIsSignedIn = true;
        mockUserProfile = {
            name: 'Mock User',
            email: 'mock.user@example.com',
            picture: `https://i.pravatar.cc/150?u=mock.user@example.com`,
        };
        onStateChangeCallback(true, true, mockUserProfile);
        return;
    }

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
};

export const handleSignoutClick = () => {
    if (!googleDriveEnabled) {
        // Mock Signout
        mockIsSignedIn = false;
        mockUserProfile = null;
        onStateChangeCallback(true, false, null);
        return;
    }
    
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token, () => {
            gapi.client.setToken('');
            onStateChangeCallback(true, false, null);
        });
    }
};

async function findBackupFile() {
    await gapi.client.load('drive', 'v3');
    const response = await gapi.client.drive.files.list({
        q: `name='${BACKUP_FILE_NAME}' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
    });
    return response.result.files.length > 0 ? response.result.files[0].id : null;
}

export async function uploadBackup(content) {
    if (!googleDriveEnabled) {
        // Mock Upload
        return new Promise(resolve => {
            setTimeout(() => {
                mockBackupContent = content;
                resolve();
            }, 800);
        });
    }

    const fileId = await findBackupFile();
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const metadata = {
        name: BACKUP_FILE_NAME,
        mimeType: 'application/json',
    };
    
    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        content +
        close_delim;
    
    const path = fileId 
        ? `/upload/drive/v3/files/${fileId}`
        : '/upload/drive/v3/files';
        
    const request = gapi.client.request({
        path: path,
        method: fileId ? 'PATCH' : 'POST',
        params: { uploadType: 'multipart' },
        headers: {
            'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        body: multipartRequestBody
    });
    
    await request;
}

export async function getBackupContent() {
    if (!googleDriveEnabled) {
        // Mock Get Content
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(mockBackupContent);
            }, 800);
        });
    }

    const fileId = await findBackupFile();
    if (!fileId) {
        return null;
    }
    await gapi.client.load('drive', 'v3');
    const response = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
    });
    return response.body;
}