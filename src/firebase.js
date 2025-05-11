// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBvyIoi9POgN-i_a0HkSVEJeX1NVx_6BFc",
    authDomain: "organizer-856c3.firebaseapp.com",
    projectId: "organizer-856c3",
    storageBucket: "organizer-856c3.appspot.com",
    messagingSenderId: "513480920908",
    appId: "1:513480920908:web:bdc67bb87a997e665289e9",
    measurementId: "G-3TXJTYM0BS"
  };
  

  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db = getFirestore(app);
