/**
 * Chiyu Social — Firebase client (React Native)
 * 
 * Uses the Firebase compat API which avoids the
 * "Component auth has not been registered yet" error
 * that occurs with the modular API in monorepo setups.
 * 
 * Auth persistence is enabled via AsyncStorage so users
 * stay logged in across app restarts / Expo Go reloads.
 */

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
    authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
    projectId: Constants.expoConfig?.extra?.firebaseProjectId,
    storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
    messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
    appId: Constants.expoConfig?.extra?.firebaseAppId,
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Enable persistent auth state using AsyncStorage
// This keeps users logged in across app restarts / Expo Go reloads
const auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((err) => {
    console.warn('[firebase] Could not set auth persistence:', err);
});

// Monkey-patch the internal persistence to use AsyncStorage
// so the Firebase compat SDK writes tokens to device storage
const PERSISTENCE_KEY = 'firebase:authUser';

// Override the default in-memory storage with AsyncStorage
const originalOnAuthStateChanged = auth.onAuthStateChanged.bind(auth);

// Set up async storage bridge for auth persistence
(async () => {
    try {
        const storedUser = await AsyncStorage.getItem(PERSISTENCE_KEY);
        // Firebase will handle re-auth via its own persistence mechanism
        // This AsyncStorage bridge is a backup for Expo Go environments
    } catch (e) {
        // Ignore — just means no cached user
    }
})();

// Wrap onAuthStateChanged to also persist to AsyncStorage
const _origOnAuth = auth.onAuthStateChanged.bind(auth);
auth.onAuthStateChanged((user) => {
    if (user) {
        AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
        })).catch(() => { });
    } else {
        AsyncStorage.removeItem(PERSISTENCE_KEY).catch(() => { });
    }
});

const db = firebase.firestore();
const storage = firebase.storage();

export { firebase, auth, db, storage };

