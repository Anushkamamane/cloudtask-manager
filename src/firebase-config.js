import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlO6XEDzR_ONtuggynCyxhR0sHbgvTNNE",
  authDomain: "cloudtask-app.firebaseapp.com",
  projectId: "cloudtask-app",
  storageBucket: "cloudtask-app.firebasestorage.app",
  messagingSenderId: "214946500110",
  appId: "1:214946500110:web:eda6ee215b6e95aef3b65f",
  measurementId: "G-8JV5WXXW21"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();