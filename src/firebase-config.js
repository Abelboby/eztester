import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

 const firebaseConfig = {
       apiKey: "AIzaSyC0VRxxbi9aYUJCsfIrJSW0UDpqJq1eeoQ",
      authDomain: "ezprints-2.firebaseapp.com",
       projectId: "ezprints-2",
       storageBucket: "ezprints-2.appspot.com",
       messagingSenderId: "223809450073",
       appId: "1:223809450073:web:562c12c1b311f16a658148",
       measurementId: "G-MRH6V5JK0G"
     };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);