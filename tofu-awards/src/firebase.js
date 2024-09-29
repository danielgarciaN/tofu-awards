// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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