import React from "react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Voting.css";
import { auth } from "../../firebase";
import { clearStoredAccessMode } from "../../utils/accessMode";

const Goodbye = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    clearStoredAccessMode();
    await signOut(auth);
  };

  return (
    <div className="voting-shell goodbye-shell">
      <section className="goodbye-card">
        <p className="section-kicker">Voto registrado</p>
        <h1 className="VotingTitle">Tu papel en la segunda gala ya esta entregado.</h1>
        <p className="subtitle">
          Gracias por votar. La ubicacion aun es secreta, el suspense sigue vivo y los resultados ya
          tienen un poco mas de destino.
        </p>

        <div className="goodbye-actions">
          <button className="button-next-back" onClick={() => navigate("/home")}>
            Volver a la home
          </button>
          <button className="button-voting" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>
      </section>
    </div>
  );
};

export default Goodbye;
