// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login/Login';
import PasswordPrompt from './components/auth/PasswordPromt/PasswordPromt';
import VotingScreen from './components/home/Voting'; // Actualizado a VotingScreen

const App = () => {

  const premioIds = ["1lixzT838IToU7IK0BIS", "B7FXUIV5Hyncc1pb5ltJ","ZyQ8ZM5Pa1YzpeonU1uQ","n9cZMGy6TgRpdMF3eBNw","uKv2D4zxT1LaW26svyw0"];


  return (
    <Router>
      <Routes>
        <Route path="/" element={<PasswordPrompt />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<VotingScreen premioIds={premioIds} />} /> {/* Nueva ruta para la pantalla de votación */}
      </Routes>
    </Router>
  );
};

export default App;
