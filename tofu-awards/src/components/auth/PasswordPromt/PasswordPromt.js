import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PasswordPrompt.css";
import { ACCESS_MODES, setStoredAccessMode } from "../../../utils/accessMode";

const SECRET_PASSWORD = "Jairorebozado";
const PREMIUM_PASSWORD = "premium";
const RESULTS_PASSWORD = "cigrunet";

const PasswordPrompt = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password === SECRET_PASSWORD) {
      setStoredAccessMode(ACCESS_MODES.STANDARD);
      navigate("/home", {
        replace: true,
        state: {
          accessUnlocked: true,
          accessMode: ACCESS_MODES.STANDARD,
        },
      });
      return;
    }

    if (password === PREMIUM_PASSWORD) {
      setStoredAccessMode(ACCESS_MODES.PREMIUM);
      navigate("/home", {
        replace: true,
        state: {
          accessUnlocked: true,
          accessMode: ACCESS_MODES.PREMIUM,
        },
      });
      return;
    }

    if (password === RESULTS_PASSWORD) {
      navigate("/resultados", { replace: true });
      return;
    }

    setFeedback({
      type: "error",
      text: "Clave incorrecta. Revisa la contrasena e intentalo otra vez.",
    });
  };

  return (
    <div className="password-page">
      <div className="password-ambient" />
      <div className="password-card">
        <p className="password-kicker">Acceso privado</p>
        <h1>Panel de acceso especial</h1>
        <p className="password-copy">
          Esta pantalla ya no interrumpe el flujo principal. Solo se usa para desbloquear modos
          especiales o consultar resultados protegidos.
        </p>

        <form className="password-form" onSubmit={handleSubmit}>
          <label className="password-field">
            <span>Clave privada</span>
            <input
              className="inputPass"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (feedback.text) {
                  setFeedback({ type: "", text: "" });
                }
              }}
              placeholder="Introduce la clave"
              required
            />
          </label>

          {feedback.text ? (
            <p className={`password-feedback ${feedback.type}`} aria-live="polite">
              {feedback.text}
            </p>
          ) : null}

          <div className="password-actions">
            <button className="secondary-access-button" type="button" onClick={() => navigate("/home")}>
              Volver a la home
            </button>
            <button className="accesButton" type="submit">
              Desbloquear
            </button>
          </div>
        </form>

        <p className="password-note">
          `Jairorebozado` mantiene el acceso privado estandar. `premium` activa la ponderacion
          premium. `cigrunet` conserva la entrada a resultados.
        </p>
      </div>
    </div>
  );
};

export default PasswordPrompt;
