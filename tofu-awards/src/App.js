// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Login from './components/auth/Login/Login';
import PasswordPrompt from './components/auth/PasswordPromt/PasswordPromt';
import Home from './components/home/Home'; // Nueva pantalla de Home
import VotingScreen from './components/home/Voting'; // Pantalla de votación
import FinalVote from './components/home/FinalVote';
import Goodbye from './components/home/Goodbye'
import Resultados from './components/home/Resultados';
import IntroduccionFinalVote from './components/home/IntroduccionFinalVote';

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

const App = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const premioIds = [
    "n7DYpw4Q9ARrw9Tdlqg7", //CUAJADA
    "mdtyCFBavd4T2rTr04vX", //SOLTERO
    "wXEzywuiBhsn2Wz5Q2ys", //XAVITADA
    "JrjIN5s4hJxW1zmgLTLd", //FUTBOL
    "V0UPK9tGKcxUnYy2G1Pj",  //DEPRESION
    "RmcOv9Wny6smSLI7UpKb", //ANFI
    "7S7F5TtzJJIxDTJdtHrU", //SENDER DEL AÑO
    "yQvlpC0HDy6O10dTKpGe", //CLIPS DEL AÑO
    "8PwRYH37sMdWi6SNKdiG", //DUO DE HERMANOS
    "Ht0hkNMHL26U7dmmNrAs", //ENFADADO
    "vBqlb3iqiVlvwgnnxlGA", //TIKTOK
    "qPXGIH2loexuPWd3m0Si", //TOXI
    "2TAtbgY6kOYl81mhqa77", //PUTERO DEL AÑO
    "OpdEGSLUhL1nO0bfQ0BW",  //PAREJA
    "HKsot8esvcMCZ65DdC6W", //DOMADO 
  ];
  
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login'); // Si no hay usuario, redirige al login
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/password-prompt" element={<PasswordPrompt />} />
      <Route path="/resultados" element={<Resultados />} />
      <Route path="/home" element={<Home />} />
      <Route path="/voting" element={<VotingScreen premioIds={premioIds} />} />
      <Route path="/finalvote" element={<FinalVote />} />
      <Route path="/goodbye" element={<Goodbye />} />
      <Route path='/introfinal' element={<IntroduccionFinalVote/>}/>
    </Routes>
  );
};

export default AppWrapper;
