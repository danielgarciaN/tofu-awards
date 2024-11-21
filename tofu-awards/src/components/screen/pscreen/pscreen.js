
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PScreen.css';

const PScreen = () => {
    const navigate = useNavigate();
  
    const handleVotingClick = () => {
      navigate('/voting'); // Redirige al sistema de votaciones
    };
  
    return (
      <div className="home-container">
        <div className="hero-section">
          <img src="/path/to/hero-image.jpg" alt="Premios ESLAND" className="hero-image" />
          <h1 className="hero-title">LOS PREMIOS ESLAND</h1>
        </div>
  
        <section className="home-description">
          <h2>Sobre los Premios</h2>
          <p>
            Los Premios ESLAND son un evento que celebra los mejores momentos del año. Desde actuaciones 
            musicales inolvidables hasta los concursos de outfits más creativos, este evento destaca la 
            creatividad y el talento de nuestra comunidad.
          </p>
        </section>
  
        <section className="home-sections">
          <div className="home-section-item">
            <h3>Concurso de Outfits</h3>
            <p>Los participantes podrán mostrar su mejor vestuario y competir por el título del outfit más creativo.</p>
          </div>
          <div className="home-section-item">
            <h3>Actuaciones Musicales</h3>
            <p>Disfruta de actuaciones en vivo de músicos y artistas invitados que harán de la noche algo inolvidable.</p>
          </div>
        </section>
  
        <section className="home-cta">
          <button className="voting-button" onClick={handleVotingClick}>
            Ir a Votaciones
          </button>
        </section>
      </div>
    );
  };

  export default PScreen;

  