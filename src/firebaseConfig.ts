// src/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBy0Bmdt3ny5UJwQ0DbHvyURCP9ZhsFfWE",
  authDomain: "bjjconnect-a806f.firebaseapp.com",
  projectId: "bjjconnect-a806f",
  storageBucket: "bjjconnect-a806f.firebasestorage.app",
  messagingSenderId: "359514947911",
  appId: "1:359514947911:web:8866dad0793bb007470c62",
  measurementId: "G-LYZL5WF9CR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;