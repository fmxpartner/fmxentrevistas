import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCcDdI1fLtQBZpQWwCRCJQZNmgwuu31vWw",
    authDomain: "system-management-1ee11.firebaseapp.com",
    projectId: "system-management-1ee11",
    storageBucket: "system-management-1ee11.firebasestorage.app",
    messagingSenderId: "768745399615",
    appId: "1:768745399615:web:de9e37843a593867d49f8a",
    measurementId: "G-DF9CM8C6BM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Exporte os métodos necessários para uso em outros arquivos
export { doc, setDoc, getDoc, collection, getDocs };