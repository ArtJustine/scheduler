/**
 * Chiyu Social — Firebase client (React Native)
 * 
 * Uses the Firebase compat API which avoids the
 * "Component auth has not been registered yet" error
 * that occurs with the modular API in monorepo setups.
 */

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
    apiKey: 'AIzaSyC9LlfyJStd8YjczRPU82BzVmTKxQmMQZ8',
    authDomain: 'socialmedia-scheduler-eb22f.firebaseapp.com',
    projectId: 'socialmedia-scheduler-eb22f',
    storageBucket: 'socialmedia-scheduler-eb22f.firebasestorage.app',
    messagingSenderId: '974176191059',
    appId: '1:974176191059:web:4b29d837e57c00a97abca6',
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

export { firebase, auth, db, storage };
