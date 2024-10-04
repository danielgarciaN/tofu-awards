// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login/Login';
import PasswordPrompt from './components/auth/PasswordPromt/PasswordPromt';
import VotingScreen from './components/home/Voting'; // Actualizado a VotingScreen

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PasswordPrompt />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<VotingScreen />} /> {/* Nueva ruta para la pantalla de votación */}
      </Routes>
    </Router>
  );
};

export default App;
