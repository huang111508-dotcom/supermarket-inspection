// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3rFKvIxxoug4k4_8VrenGfHNu-cQdX8Q",
  authDomain: "supermarket-inspection.firebaseapp.com",
  projectId: "supermarket-inspection",
  storageBucket: "supermarket-inspection.firebasestorage.app",
  messagingSenderId: "838117379096",
  appId: "1:838117379096:web:20e743eeee729a60ff076d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Enable Offline Persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a a time.
        console.warn("Firebase persistence failed: multiple tabs open");
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.warn("Firebase persistence not supported by this browser");
    }
});