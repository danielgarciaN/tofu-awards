import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Voting.css";
import { getStoredAccessMode, isPremiumAccess } from "../../utils/accessMode";

const IntroduccionFinalVote = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const accessMode = location.state?.accessMode || getStoredAccessMode();
  const isPremium = isPremiumAccess(accessMode) || Boolean(location.state?.isPremium);

  return (
    <div className="voting-shell intro-shell">
      <section className="intro-card">
        <p className="section-kicker">Ultima parada</p>
        <h1 className="VotingTitle">Llega el voto a Tofu del Ano</h1>
        <p className="tofu-description">
          Este premio corona a quien mejor ha rendido en el conjunto del ano: nivel sostenido,
          trayectoria general, impacto real en el grupo y capacidad de aparecer con autoridad cuando
          tocaba. No es un voto simpatia. Es una decision de gala.
        </p>
        <p className="tofu-description secondary">
          Piensa en quien ha mantenido la version mas fuerte de si mismo durante todo este tiempo. Si
          estas en modo premium, la ponderacion especial ya esta aplicada al podio final.
        </p>

        <div className="intro-actions">
          <button className="button-next-back" onClick={() => navigate("/voting", { state: { accessMode, isPremium } })}>
            Volver a categorias
          </button>
          <button className="button-voting" onClick={() => navigate("/finalvote", { state: { accessMode, isPremium } })}>
            Continuar al voto final
          </button>
        </div>
      </section>
    </div>
  );
};

export default IntroduccionFinalVote;
