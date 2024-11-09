// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login/Login';
import PasswordPrompt from './components/auth/PasswordPromt/PasswordPromt';
import VotingScreen from './components/home/Voting'; // Actualizado a VotingScreen

const App = () => {

  const premioIds = [
    "1MNYMNAOyFXJyfuqdp5z",
    "11ixzT838IToU7IK0BIS",
    "2wqjAkQ6AgWEKHZ2ev99",
    "B7FXUIV5Hyncc1pb5ltJ",
    "JLsAMmvyJFaDTgQzfaFQa",
    "RWM2j5hryvogzP6oTWYk",
    "ZyQ8ZM5Pa1YzpeonU1uQ",
    "n9cZMGy6TgRpdMF3eBNw",
    "nP2kfqHb6LpwrqzL6vW",
    "uKv2D4zxT1LaW26svyw"
  ];
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PasswordPrompt />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<VotingScreen premioIds={premioIds} />} />
      </Routes>
    </Router>
  );
};

export default App;
