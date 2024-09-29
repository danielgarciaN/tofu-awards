// src/components/auth/PasswordPrompt.js

import React, { useState } from 'react';
import './../../css/PasswordPrompt.css'; // Asegúrate de crear este archivo CSS

const PasswordPrompt = () => {
  const [password, setPassword] = useState('');
  const SECRET_PASSWORD = 'XaviButanero'; // Cambia esto por tu contraseña secreta

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === SECRET_PASSWORD) {
      window.location.href = '/login'; // Redirige a la página de login
    } else {
      alert('Contraseña incorrecta. Intenta de nuevo.'); // Mensaje de error
    }
  };

  return (
    <div className="background">
      <video autoPlay loop muted className="video-background">
        <source src={require('./../../assets/videos/overlay.mp4')} type="video/mp4" /> {/* Ruta al video */}
        Tu navegador no soporta el elemento de video.
      </video>
      <div className="password-container">
        <h1>Introduce la Contraseña Secreta</h1>
        <form onSubmit={handleSubmit}>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Contraseña secreta"
            required 
          />
          <button type="submit">Acceder</button>
        </form>
      </div>
    </div>
  );
};

export default PasswordPrompt;
