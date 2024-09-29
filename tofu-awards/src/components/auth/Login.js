// src/components/auth/Login.js

import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// Tu configuración de Firebase
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isRegistering) {
        // Registro del nuevo usuario
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Guardar nombre de usuario en Firestore
        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: email
        });
        alert('Usuario registrado con éxito!');
        navigate('/home'); // Redirige a la página principal después del registro
      } else {
        // Inicio de sesión
        await signInWithEmailAndPassword(auth, email, password);
        alert('Inicio de sesión exitoso!');
        navigate('/home'); // Redirige a la página principal después de iniciar sesión
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>{isRegistering ? 'Registrar' : 'Iniciar Sesión'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <input 
            type="text" 
            placeholder="Nombre de usuario" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        )}
        <input 
          type="email" 
          placeholder="Correo electrónico" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">{isRegistering ? 'Registrar' : 'Iniciar Sesión'}</button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Ya tengo una cuenta' : 'Crear cuenta'}
      </button>
    </div>
  );
};

export default Login;
