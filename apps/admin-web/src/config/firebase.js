
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyBRIm__88rGh0tL6oD1JPSWhkmdgxxswbw",
  authDomain: "unieats-39120.firebaseapp.com",
  projectId: "unieats-39120",
  storageBucket: "unieats-39120.firebasestorage.app",
  messagingSenderId: "961323771084",
  appId: "1:961323771084:web:39d601337d9ed74739ce69",
  measurementId: "G-B2CMFETP0R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);