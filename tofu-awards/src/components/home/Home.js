import React, { useMemo } from "react";
import { signOut } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import "./Home.css";
import foto1 from "./../../assets/fotos/foto1.jpeg";
import foto2 from "./../../assets/fotos/foto2.jpg";
import foto3 from "./../../assets/fotos/foto3.jpeg";
import { auth } from "../../firebase";
import {
  clearStoredAccessMode,
  getStoredAccessMode,
  isPremiumAccess,
} from "../../utils/accessMode";
import { getPointsBreakdown } from "../../utils/voting";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const accessMode = location.state?.accessMode || getStoredAccessMode();
  const isPremium = isPremiumAccess(accessMode);
  const standardPoints = getPointsBreakdown(4, false);
  const standardThreePoints = getPointsBreakdown(3, false);
  const premiumPoints = getPointsBreakdown(4, true);
  const premiumThreePoints = getPointsBreakdown(3, true);
  const accessBanner = useMemo(() => {
    if (!location.state?.accessUnlocked) {
      return "";
    }

    return isPremium
      ? "Modo premium activado. Las categorias premium usaran la ponderacion especial 8-5-2-0."
      : "Acceso privado validado. Ya puedes continuar con el flujo principal sin pantallas extra.";
  }, [isPremium, location.state]);

  const handleStartVoting = () => {
    navigate("/voting", {
      state: {
        accessMode,
        isPremium,
      },
    });
  };

  const handlePrivateAccess = () => navigate("/password-prompt");

  const handleLogout = async () => {
    clearStoredAccessMode();
    await signOut(auth);
  };

  return (
    <div className="home-container">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-kicker">Tofu Awards II</p>
          <h1>La segunda edicion llega mas tarde que nunca.</h1>
          <p className="home-lead">
            Han pasado muchas cosas, el grupo ha vivido nuevas experiencias y ya toca lo que de
            verdad importa: celebrar la segunda gala con una web mas pulida, mas clara y preparada
            para votar desde movil.
          </p>

          <div className="hero-meta">
            <span>Segunda edicion</span>
            <span>Ubicacion por decidir</span>
            <span>Votacion adaptada a movil</span>
          </div>

          <div className="hero-actions">
            <button className="start-voting-button" onClick={handleStartVoting}>
              Empezar votacion
            </button>
            <button className="ghost-button" onClick={handlePrivateAccess}>
              Acceso privado
            </button>
            <button className="ghost-button subtle" onClick={handleLogout}>
              Cerrar sesion
            </button>
          </div>

          {accessBanner ? <p className="home-banner">{accessBanner}</p> : null}
        </div>

        <div className="home-hero-visual">
          <img src={foto1} alt="Momentos compartidos del grupo en Tofu Awards" />
          <div className="hero-visual-card">
            <p className="hero-visual-kicker">Estado del evento</p>
            <strong>La gala esta en camino</strong>
            <span>
              La ubicacion sigue siendo secreta por ahora. Se decidira mas adelante, como corresponde
              a una ceremonia que sabe manejar el suspense.
            </span>
          </div>
        </div>
      </section>

      <section className="home-grid">
        <article className="home-panel">
          <img src={foto2} alt="Ambientacion de la gala Tofu Awards" />
          <div className="home-panel-copy">
            <p className="home-kicker">Lo que cambia</p>
            <h2>Una edicion mas refinada</h2>
            <p>
              Esta web deja atras la sensacion improvisada del primer impulso y presenta una
              experiencia mas limpia, elegante y estable. Menos ruido, mejor lectura y una
              navegacion que te lleva del acceso a la votacion sin pasos innecesarios.
            </p>
            <p>
              La gran novedad es clara: ahora tambien puedes votar comodamente desde el movil, sin
              renunciar a ver nominados, revisar material y cerrar tu voto final desde cualquier
              pantalla.
            </p>
          </div>
        </article>

        <article className="home-panel reverse">
          <img src={foto3} alt="Votacion de los nominados de Tofu Awards" />
          <div className="home-panel-copy">
            <p className="home-kicker">Tofu del Ano</p>
            <h2>El premio mas serio dentro del caos</h2>
            <p>
              Tofu del Ano no premia al mas popular ni al que mejor te caiga ese dia. Reconoce a quien
              ha rendido mejor durante el periodo, quien ha mantenido el nivel mas alto o quien ha
              dejado la trayectoria general mas fuerte entre todos.
            </p>
            <p>
              Vota pensando en rendimiento, constancia, impacto y capacidad real para haber estado por
              encima del resto cuando tocaba aparecer.
            </p>
          </div>
        </article>
      </section>

      <section className="home-rules">
        <div className="rules-header">
          <p className="home-kicker">Sistema de votacion</p>
          <h2>Puntuacion actualizada para la segunda gala</h2>
          <p>
            En todas las categorias se vota por orden de preferencia. El ultimo puesto no suma puntos.
            En las categorias premium ya no se duplica la tabla general: ahora tienen ponderacion
            propia.
          </p>
        </div>

        <div className="rules-grid">
          <article className="rules-card">
            <h3>Categorias normales</h3>
            <p>Con 4 nominados</p>
            <ul>
              {standardPoints.map(({ position, points }) => (
                <li key={`standard-four-${position}`}>
                  <span>{position}o puesto</span>
                  <strong>{points} pts</strong>
                </li>
              ))}
            </ul>
            <p>Con 3 nominados</p>
            <ul>
              {standardThreePoints.map(({ position, points }) => (
                <li key={`standard-three-${position}`}>
                  <span>{position}o puesto</span>
                  <strong>{points} pts</strong>
                </li>
              ))}
            </ul>
          </article>

          <article className="rules-card premium">
            <h3>Categorias premium</h3>
            <p>Con 4 nominados</p>
            <ul>
              {premiumPoints.map(({ position, points }) => (
                <li key={`premium-four-${position}`}>
                  <span>{position}o puesto</span>
                  <strong>{points} pts</strong>
                </li>
              ))}
            </ul>
            <p>Con 3 nominados</p>
            <ul>
              {premiumThreePoints.map(({ position, points }) => (
                <li key={`premium-three-${position}`}>
                  <span>{position}o puesto</span>
                  <strong>{points} pts</strong>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="home-closing">
        <div>
          <p className="home-kicker">Siguiente paso</p>
          <h2>Entra, vota y deja tu version oficial de la historia.</h2>
        </div>
        <button className="start-voting-button" onClick={handleStartVoting}>
          Ir a votar ahora
        </button>
      </section>
    </div>
  );
};

export default Home;
