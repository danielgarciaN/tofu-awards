// src/components/auth/PasswordPrompt.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import './PasswordPrompt.css'; // Asegúrate de crear este archivo CSS

const PasswordPrompt = () => {
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Estado para el mensaje de error
  const SECRET_PASSWORD = 'XaviButanero'; // Cambia esto por tu contraseña secreta
  const navigate = useNavigate(); // Define navigate para redirigir

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === SECRET_PASSWORD) {
      navigate('/home'); // Redirige a la página de Home si la contraseña es correcta
    } else if (password === 'premium') {
      navigate('/home', { state: { isPremium: true } }); // Redirige a Home con la propiedad isPremium si la contraseña es premium
    } else {
      setErrorMessage('Contraseña incorrecta. Intentalo de nuevo.'); // Establece el mensaje de error
    }
  };

  return (
    <div className="background">
      <video autoPlay loop muted className="video-background">
        <source src={require('./../../../assets/videos/overlay.mp4')} type="video/mp4" /> {/* Ruta al video */}
        Tu navegador no soporta el elemento de video.
      </video>
      <div className="password-container">
        <h1 className="title">TOFU AWARDS</h1> {/* Título luminoso */}
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
          {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Mensaje de error */}
        </form>
      </div>
    </div>
  );
};

export default PasswordPrompt;
