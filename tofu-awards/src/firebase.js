// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Importar Firestore
import { getAuth } from "firebase/auth"; // Importar Auth
import { getStorage } from "firebase/storage"; // Para Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6i7mGHA5uGX1Ctlzt_jlBD8T0K_caSHw",
  authDomain: "tofu-awards.firebaseapp.com",
  projectId: "tofu-awards",
  storageBucket: "tofu-awards.appspot.com",
  messagingSenderId: "384964093817",
  appId: "1:384964093817:web:c67af748562615b31eb1a8",
  measurementId: "G-C0MBZPT2NV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializa Firestore y Auth
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
// Exporta el objeto `db` y `auth` para usarlos en otros archivos
export { db, auth, storage };
