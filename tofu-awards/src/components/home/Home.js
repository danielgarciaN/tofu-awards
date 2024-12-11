import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css';
import foto1 from './../../assets/fotos/foto1.jpeg';
import foto2 from './../../assets/fotos/foto2.jpg';
import foto3 from './../../assets/fotos/foto3.jpeg';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isPremium = location.state?.isPremium || false;

  const handleStartVoting = () => {
    navigate('/voting', { state: { isPremium } }); // Pasar isPremium al componente de votación
  };

  return (
    <div className="home-container">
      {/* Sección de título principal similar a la imagen */}
      <section className="top-banner">
        <h1 className="banner-title">TOFU AWARDS</h1>
      </section>

      {/* Sección introductoria */}
      <section className="intro-section">
        <div className="full-width-section">
          <div className="text-container">
            <h1>Un reconocimiento único</h1>
            <br/>
            <p>
              Los Premios Tofu no solo celebran la creatividad y el esfuerzo, sino que también buscan inmortalizar esos momentos inolvidables que nos hicieron reír, emocionarnos, y, por supuesto, nos llenaron de recuerdos únicos.
            </p>
            <br/>
            <p>
              Los Premios Tofu nacen de la necesidad de unir a nuestro grupo en un evento donde lo importante no es quién gane, sino cómo disfrutamos juntos reviviendo esos momentos.
            </p>
          </div>
          <img src={foto1} alt="Imagen de la ceremonia Tofu Awards" />
        </div>
      </section>

      {/* Sección de fecha, ubicación y premio especial */}
      <section className="event-details">
        <div className="full-width-section">
          <img src={foto2} alt="Ubicación del evento Tofu Awards" />
          <div className="text-container">
            <h2>Detalles del Evento</h2>
            <p><strong>Fecha:</strong> 21 de diciembre a las 18:00</p>
            <p><strong>Ubicación:</strong> Església de Valldoreix</p>
            <br/>
            <p>
              Este año, nos reuniremos en la icónica Església de Valldoreix. En este ambiente inmejorable, llevaremos a cabo el premio al <strong>"Mejor Outfit de la Noche"</strong>, un reconocimiento especial que será entregado en directo.
            </p>
            <br/>
            <p>
              Prepárate para lucir tus mejores galas, ya que habrá una <strong>alfombra roja</strong> para que todos podamos posar y mostrar nuestros outfits. No olvides traer algo de <strong>pica pica</strong> para compartir mientras celebramos.
            </p>
          </div>
        </div>
      </section>

      {/* Sección explicando el funcionamiento de los votos */}
      <section className="voting-details">
        <div className="full-width-section">
          <div className="text-container">
            <h2>¿Cómo Funcionan los Votos?</h2>
            <br/>
            <p>
              Cada categoría cuenta con un grupo de nominados. Se podrá votar por los mejores en orden de preferencia del 1 al 3 o del 1 al 4, dependiendo de la cantidad de nominados. Además, se podrá ver un video relacionado con cada nominado para ayudar en la decisión.
            </p>
            <br/>
            <p>
              Podrás votar hasta el 18 de diciembre y cada vez que ingreses podrás actualizar tus votos, asegurándote de que tu decisión sea la correcta hasta el último momento.
            </p>
            <br/>
            <p>
              Cuando hayas acabado de votar, podrás darle a <strong>Votar Premio Final</strong> para votar al premio de Tofu del año.
            </p>
          </div>
          <img src={foto3} alt="Funcionamiento de los votos" />
        </div>
      </section>

      {/* Botón al final para empezar a votar */}
      <div className="voting-button-container">
        <button className="start-voting-button" onClick={handleStartVoting}>Ir a Votar</button>
      </div>
    </div>
  );
};

export default Home;
