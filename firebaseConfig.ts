
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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

// Note: Offline persistence has been disabled to ensure multi-device synchronization is always fresh.
