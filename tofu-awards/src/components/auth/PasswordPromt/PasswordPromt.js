// src/components/auth/PasswordPrompt.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PasswordPrompt.css';

const PasswordPrompt = () => {
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const SECRET_PASSWORD = 'XaviButanero';
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === SECRET_PASSWORD) {
      navigate('/home');
    } else if (password === 'premium') {
      navigate('/home', { state: { isPremium: true } });
    } else if (password === "cigrunet") {
      navigate('/resultados'); // Redirige a la página de Resultados
    }    
    else {
      setErrorMessage('Contraseña incorrecta. Intentalo de nuevo.');
    }
  };

  return (
    <div className="background">
      <video autoPlay loop muted className="video-background">
        <source src={require('./../../../assets/videos/overlay.mp4')} type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>
      <div className="password-container">
        <h1 className="title">TOFU AWARDS</h1>
        <h2 className="subtitle">INTRODUCE LA CONTRASEÑA SECRETA</h2>
        <form onSubmit={handleSubmit}>
          <input
            className='inputPass'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña secreta"
            required
          />
          <button className='accesButton' type="submit">Acceder</button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default PasswordPrompt;
