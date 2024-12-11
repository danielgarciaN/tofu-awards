import React from "react";
import { useNavigate } from "react-router-dom";
import "./Voting.css";

const IntroduccionFinalVote = () => {
  const navigate = useNavigate();

  const handleContinueToVoting = () => {
    navigate("/finalvote"); // Redirige al componente de votación final
  };

  return (
    <div className="voting-container">
      <video autoPlay loop muted className="video-background">
        <source src={require("./../../assets/videos/overlay (2).mp4")} type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>

      <h1 className="VotingTitle">Premio Tofu del Año</h1>
      <p className="tofu-description">
        El Premio Tofu del Año es un reconocimiento especial que no busca premiar al más popular ni al que mejor te caiga, sino al que haya destacado por su actitud, esfuerzo y contribución a los momentos más memorables de este año. 
        <br/><br/>
        Rogamos encarecidamente que los votos se realicen de manera objetiva, evitando votar por uno mismo, y valorando quién realmente ha "performeado" mejor durante este tiempo. ¡Hagamos de este premio un verdadero homenaje al espíritu del Tofu del Año!
      </p>



      <button className="button-voting" onClick={handleContinueToVoting}>
        Continuar con el Voto Final
      </button>
    </div>
  );
};

export default IntroduccionFinalVote;
