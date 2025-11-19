// Import the functions you need from the SDKs you need
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxQyZucy1UQ9nc7FucTMXHBdcULH5ljxw",
  authDomain: "skill-up-plus-31b46.firebaseapp.com",
  databaseURL: "https://skill-up-plus-31b46-default-rtdb.firebaseio.com",
  projectId: "skill-up-plus-31b46",
  storageBucket: "skill-up-plus-31b46.firebasestorage.app",
  messagingSenderId: "662744464859",
  appId: "1:662744464859:web:c42aab3717e1c10af2fbfe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
