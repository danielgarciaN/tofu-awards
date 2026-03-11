import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./components/auth/Login/Login";
import PasswordPrompt from "./components/auth/PasswordPromt/PasswordPromt";
import Home from "./components/home/Home";
import VotingScreen from "./components/home/Voting";
import FinalVote from "./components/home/FinalVote";
import Goodbye from "./components/home/Goodbye";
import Resultados from "./components/home/Resultados";
import IntroduccionFinalVote from "./components/home/IntroduccionFinalVote";
import { auth } from "./firebase";

const PREMIO_IDS = [
  "n7DYpw4Q9ARrw9Tdlqg7",
  "mdtyCFBavd4T2rTr04vX",
  "wXEzywuiBhsn2Wz5Q2ys",
  "JrjIN5s4hJxW1zmgLTLd",
  "V0UPK9tGKcxUnYy2G1Pj",
  "RmcOv9Wny6smSLI7UpKb",
  "7S7F5TtzJJIxDTJdtHrU",
  "yQvlpC0HDy6O10dTKpGe",
  "8PwRYH37sMdWi6SNKdiG",
  "Ht0hkNMHL26U7dmmNrAs",
  "vBqlb3iqiVlvwgnnxlGA",
  "qPXGIH2loexuPWd3m0Si",
  "2TAtbgY6kOYl81mhqa77",
  "OpdEGSLUhL1nO0bfQ0BW",
  "HKsot8esvcMCZ65DdC6W",
];

const ProtectedRoute = ({ isAuthenticated, children }) =>
  isAuthenticated ? children : <Navigate to="/login" replace />;

const PublicRoute = ({ isAuthenticated, children }) =>
  isAuthenticated ? <Navigate to="/home" replace /> : children;

const AppRoutes = () => {
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(Boolean(user));
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authReady) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-card">
          <p className="app-loading-kicker">Tofu Awards II</p>
          <h1>Preparando la gala</h1>
          <p>Verificando tu sesion y cargando la experiencia de votacion.</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
      <Route
        path="/login"
        element={
          <PublicRoute isAuthenticated={isAuthenticated}>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/password-prompt"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <PasswordPrompt />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resultados"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Resultados />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/voting"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <VotingScreen premioIds={PREMIO_IDS} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finalvote"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <FinalVote />
          </ProtectedRoute>
        }
      />
      <Route
        path="/goodbye"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Goodbye />
          </ProtectedRoute>
        }
      />
      <Route
        path="/introfinal"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <IntroduccionFinalVote />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
    </Routes>
  );
};

const AppWrapper = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default AppWrapper;
