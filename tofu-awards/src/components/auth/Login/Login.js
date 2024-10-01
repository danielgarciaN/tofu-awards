// src/components/auth/Login.js

import React, { useState } from "react";
import { initializeApp } from "firebase/app"; // Importa la inicialización de Firebase
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"; // Importa las funciones necesarias de Firebase Auth
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Importa Firestore
import './Login.css';
import SignInForm from "./SignInForm"; // Importa tu componente de inicio de sesión
import SignUpForm from "./SignUpForm"; // Importa tu componente de registro

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA6i7mGHA5uGX1Ctlzt_jlBD8T0K_caSHw",
  authDomain: "tofu-awards.firebaseapp.com",
  projectId: "tofu-awards",
  storageBucket: "tofu-awards.appspot.com",
  messagingSenderId: "384964093817",
  appId: "1:384964093817:web:c67af748562615b31eb1a8",
  measurementId: "G-C0MBZPT2NV"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Inicializa Firestore

const Login = () => {
  const [type, setType] = useState("signIn");

  const handleOnClick = (text) => {
    if (text !== type) {
      setType(text);
    }
  };

  const containerClass = "container " + (type === "signUp" ? "right-panel-active" : "");

  return (
    <div className="App">
      <h2>Formulario de Ingreso/Registro</h2>
      <div className={containerClass} id="container">
        <SignUpForm switchToSignIn={() => handleOnClick("signIn")} auth={auth} db={db} />
        <SignInForm switchToSignUp={() => handleOnClick("signUp")} auth={auth} />
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>¡Bienvenido de nuevo!</h1>
              <p>Para mantenerte conectado, inicia sesión con tu información personal</p>
              <button className="ghost" id="signIn" onClick={() => handleOnClick("signIn")}>
                Iniciar Sesión
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>¡Hola, amigo!</h1>
              <p>Ingresa tus datos personales y comienza tu viaje con nosotros</p>
              <button className="ghost" id="signUp" onClick={() => handleOnClick("signUp")}>
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
