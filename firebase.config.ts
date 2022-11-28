import firebase from "firebase/app";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2JZxtbvpQWqxJDjw3HsUdgNXX9B29I40",
  authDomain: "icheckit-6a8bb.firebaseapp.com",
  projectId: "icheckit-6a8bb",
  storageBucket: "icheckit-6a8bb.appspot.com",
  messagingSenderId: "160010861440",
  appId: "1:160010861440:web:6770d29d102be5703f5f65",
  measurementId: "G-MZWH337QWV",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore();

export default db;
