// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import PasswordPrompt from './components/auth/PasswordPromt';
import Home from './components/home/home'; // Asumiendo que tienes un componente Home

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PasswordPrompt />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} /> {/* Página principal */}
      </Routes>
    </Router>
  );
};

export default App;
