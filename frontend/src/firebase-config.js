// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
    apiKey: 'AIzaSyD6m_tPmfnmysgTAP47PhmtZmBELIBfA5c',
    authDomain: 'poleeducation-fcacb.firebaseapp.com',
    projectId: 'poleeducation-fcacb',
    storageBucket: 'poleeducation-fcacb.firebasestorage.app',
    messagingSenderId: '479277053322',
    appId: '1:479277053322:web:a993a8ef9ad5ed04a5c473',
    measurementId: 'G-6TMHTEJEHR',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
