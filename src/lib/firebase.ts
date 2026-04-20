import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBQ85u7BBoGx6buZ46hYI2lPcfSexjyvWA",
  authDomain: "suggest-a-product.firebaseapp.com",
  projectId: "suggest-a-product",
  storageBucket: "suggest-a-product.firebasestorage.app",
  messagingSenderId: "8212228390",
  appId: "1:8212228390:web:f945dbee42f401a2c8f9e7",
  measurementId: "G-3R85SEYP21",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Analytics only initializes in supported (browser) environments.
if (typeof window !== "undefined") {
  isSupported()
    .then((ok) => {
      if (ok) getAnalytics(app);
    })
    .catch(() => {
      /* analytics unsupported — ignore */
    });
}
