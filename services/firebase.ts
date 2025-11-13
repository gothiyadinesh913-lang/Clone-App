
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, Firestore } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { FirebaseConfig } from '../types';
import toast from 'react-hot-toast';

const firebaseConfig: FirebaseConfig = {
    apiKey: "AIzaSyBB6RF-kacGwp5DmvXb79459hiA7IHbFX4",
    authDomain: "multipal-app-clone.firebaseapp.com",
    projectId: "multipal-app-clone",
    storageBucket: "multipal-app-clone.firebasestorage.app",
    messagingSenderId: "594164248878",
    appId: "1:594164248878:android:9b29f1c439026df39fcabf"
};

const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export const defaultUserData = {
    clonedApps: [],
    settings: { 
        theme: 'light', 
        lastBackup: null,
        isAutoBackupEnabled: false,
    }
};

export const signUp = async (email, password, username, mobile) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create a user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username,
        mobile,
        email,
        createdAt: new Date().toISOString(),
        ...defaultUserData
    });
    
    return user;
};

export const signIn = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

export const signOutUser = async () => {
    await signOut(auth);
};

export const getUserData = async (uid: string) => {
    if (!uid) return null;
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data() : null;
};

export const updateUserData = async (uid: string, data: any) => {
    if (!uid || !db) return;
    const userDocRef = doc(db, 'users', uid);
    try {
        await updateDoc(userDocRef, data);
    } catch (error: any) {
        if (error.code === 'not-found') {
            try {
                // If doc doesn't exist, create it by setting with merge.
                await setDoc(userDocRef, data, { merge: true });
            } catch (createError: any) {
                 console.error("Failed to create user document after update failed:", createError);
                 toast.error("Failed to save data. Please try again.");
            }
        } else {
            // This catches other errors like permission-denied
            console.error("Failed to update user data:", error.message);
            toast.error("Failed to save data. Changes may not be persisted.");
        }
    }
};
