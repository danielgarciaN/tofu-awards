import React from "react";
import { useNavigate } from "react-router-dom";
import './Voting.css'; // Reutiliza los estilos de Voting.js

const Goodbye = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/home'); // Redirige a la página de inicio
  };

  return (
    <div className="voting-container goodbye-container">
      <video autoPlay loop muted className="video-background">
        <source src={require('./../../assets/videos/overlay (2).mp4')} type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>

      <div className="goodbye-content">
        <h1 className="VotingTitle">¡Gracias por votar!</h1>
        <h1 className="VotingTitle">Nos vemos en la gala</h1>
        <button className="button-voting" onClick={handleGoHome} style={{ marginTop: "40px" }}>
          Salir
        </button>
      </div>
    </div>
  );
};


export default Goodbye;
