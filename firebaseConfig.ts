// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";


// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyAEV5Ujdi5etdMKjdoynVGACRRTfGJIEiE',
  authDomain: 'sales-leader-3898b.firebaseapp.com',
  projectId: 'sales-leader-3898b',
  storageBucket: 'sales-leader-3898b.firebasestorage.app',
  messagingSenderId: '846240503883',
  appId: '1:846240503883:web:9c39665bce04dd0f0895ce',
  measurementId: 'G-56E91R2HRM',
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app); 
// ✅ Export auth and firestore
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app); // ✅ This fixes the missing 'db' error
