// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Login from './components/auth/Login/Login';
import PasswordPrompt from './components/auth/PasswordPromt/PasswordPromt';
import Home from './components/home/Home'; // Nueva pantalla de Home
import VotingScreen from './components/home/Voting'; // Pantalla de votación
import FinalVote from './components/home/FinalVote';

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
    "18V7dToVVdLkOuXZQbGz",
    "2Xn0ZXVZkNcLXzw9YShd",
    "8Gq8Bi17lqseLiJUdVNR",
    "8v24cFdTNCvUVbVQsuyg",
    "BcN0Fkl0aQg6vIVeoVgi",
    "DQdnafra6y5fTVNWS41c",
    "DX6abhKES5GiZ7dIBhL7",
    "EFXdxA0VwXMRUZT4pdTh",
    "WQgq08qVERn900GjfHMv",
    "WrPy0o0bZfwfQ0fOj3l",
    "Y3ESrKGdj17EW2XjJxil",
    "ofMK52NuIrtSIZJ36p7S",
    "potnFWNSXguQxJyFpJgx", 
    "t5S5f2lmUFBu0vOsAseS",
    "t6812HZp0VLwc4QkGRjz"
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
      <Route path="/home" element={<Home />} />
      <Route path="/voting" element={<VotingScreen premioIds={premioIds} />} />
      <Route path="/finalvote" element={<FinalVote />} />
    </Routes>
  );
};

export default AppWrapper;
