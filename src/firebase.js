import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB17kHGjmKaBjk160TKCQx0b-ng1BsKQGs",
  authDomain: "senior-acadmey.firebaseapp.com",
  projectId: "senior-acadmey",
  storageBucket: "senior-acadmey.firebasestorage.app",
  messagingSenderId: "886216333445",
  appId: "1:886216333445:web:b289ce50efb0cde964b1ec",
  measurementId: "G-PT5ZD1BQ9X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };