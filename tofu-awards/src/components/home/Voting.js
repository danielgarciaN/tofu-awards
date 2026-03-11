import React, { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "./../../firebase.js";
import "./Voting.css";
import { getStoredAccessMode, isPremiumAccess } from "../../utils/accessMode";
import {
  getPointsBreakdown,
  getPointsForPosition,
  getRequiredPositions,
  validateRankingSelection,
} from "../../utils/voting";

const getAwardName = (award) => award?.nombre || award?.name || "Premio";
const getAwardDescription = (award) =>
  award?.descripcion || award?.description || "Ordena a tus nominados y guarda tu voto.";
const getNomineeName = (nominee) => nominee?.nombre || nominee?.name || "Nominado";
const getNomineeImage = (nominee) => nominee?.imageURL || nominee?.imageUrl || nominee?.mediaUrl || "";
const getNomineeVideo = (nominee) => nominee?.videoURL || nominee?.videoUrl || "";
const getNomineeExtraImage = (nominee) => nominee?.mediaImageURL || nominee?.mediaUrl || "";

const Voting = ({ premioIds }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const accessMode = location.state?.accessMode || getStoredAccessMode();
  const isPremium = isPremiumAccess(accessMode) || Boolean(location.state?.isPremium);
  const [premio, setPremio] = useState(null);
  const [nominados, setNominados] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [premiosData, setPremiosData] = useState({});
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMediaURL, setSelectedMediaURL] = useState("");
  const [isMediaVideo, setIsMediaVideo] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = auth.currentUser;

  const requiredPositions = useMemo(() => getRequiredPositions(nominados.length), [nominados.length]);
  const scoreBreakdown = useMemo(
    () => getPointsBreakdown(nominados.length, isPremium),
    [isPremium, nominados.length]
  );
  const currentAwardName = getAwardName(premio);
  const scoreLegend = scoreBreakdown
    .map(({ position, points }) => `${position}o: ${points} pts`)
    .join(" · ");

  useEffect(() => {
    let cancelled = false;

    const fetchPremioAndNominados = async () => {
      setLoading(true);
      setLoadError("");
      setFeedback({ type: "", text: "" });
      setSelectedVotes({});
      const premioId = premioIds[currentIndex];

      if (premiosData[premioId]) {
        if (!cancelled) {
          setPremio(premiosData[premioId].premio);
          setNominados(premiosData[premioId].nominados);
          setLoading(false);
        }
        return;
      }

      try {
        const premioRef = doc(db, "premios", premioId);
        const premioDoc = await getDoc(premioRef);

        if (!premioDoc.exists()) {
          throw new Error(`El premio ${premioId} no existe.`);
        }

        const premioData = premioDoc.data();
        const nominadosSnapshot = await getDocs(collection(premioRef, "nominados"));
        const nominadosList = nominadosSnapshot.docs.map((snapshot) => ({
          id: snapshot.id,
          ...snapshot.data(),
        }));

        if (!cancelled) {
          setPremiosData((previousData) => ({
            ...previousData,
            [premioId]: { premio: premioData, nominados: nominadosList },
          }));
          setPremio(premioData);
          setNominados(nominadosList);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error al cargar el premio:", error);
          setLoadError("No hemos podido cargar esta categoria. Intentalo de nuevo.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPremioAndNominados();

    return () => {
      cancelled = true;
    };
  }, [currentIndex, premioIds, premiosData]);

  const handleSelectVote = (nominadoId, vote) => {
    setSelectedVotes((previousVotes) => ({
      ...previousVotes,
      [nominadoId]: vote,
    }));
  };

  const handleShowMedia = (mediaURL, isVideo) => {
    setSelectedMediaURL(mediaURL);
    setIsMediaVideo(isVideo);
    setShowMediaModal(true);
  };

  const handleCloseMedia = () => {
    setShowMediaModal(false);
    setSelectedMediaURL("");
    setIsMediaVideo(false);
  };

  const handleSubmitVotes = async () => {
    if (!user) {
      setFeedback({
        type: "error",
        text: "Tu sesion ha expirado. Vuelve a iniciar sesion.",
      });
      navigate("/login", { replace: true });
      return;
    }

    if (!validateRankingSelection(selectedVotes, nominados.length)) {
      setFeedback({
        type: "error",
        text: `Debes asignar ${requiredPositions.join(", ")} sin repetir posiciones antes de enviar.`,
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", text: "" });

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userAwardVotes = {};

      for (const [nominadoId, votePosition] of Object.entries(selectedVotes)) {
        const points = getPointsForPosition(votePosition, nominados.length, isPremium);
        userAwardVotes[nominadoId] = points;

        const nominadoRef = doc(db, "premios", premioIds[currentIndex], "nominados", nominadoId);
        const nominadoDoc = await getDoc(nominadoRef);
        const nominadoData = nominadoDoc.data() || {};
        const updatedVotedUsers = {
          ...(nominadoData.votedUsers || {}),
          [user.uid]: {
            email: user.email || "",
            timestamp: new Date().toISOString(),
            vote: points,
          },
        };
        const totalPoints = Object.values(updatedVotedUsers).reduce(
          (sum, userVote) => sum + (userVote.vote || 0),
          0
        );

        await updateDoc(nominadoRef, {
          votedUsers: updatedVotedUsers,
          votes: totalPoints,
        });
      }

      await setDoc(
        userDocRef,
        {
          [currentAwardName]: userAwardVotes,
        },
        { merge: true }
      );

      setFeedback({
        type: "success",
        text: `Voto guardado en ${currentAwardName}. Puedes cambiarlo mas adelante si hace falta.`,
      });
    } catch (error) {
      console.error("Error al registrar los votos:", error);
      setFeedback({
        type: "error",
        text: "No hemos podido registrar tus votos. Intentalo otra vez.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="voting-shell">
        <div className="voting-loader-card">
          <p className="section-kicker">Tofu Awards II</p>
          <h1>Cargando categoria</h1>
          <p>Estamos preparando los nominados y la tabla de puntos.</p>
        </div>
      </div>
    );
  }

  if (loadError || !premio) {
    return (
      <div className="voting-shell">
        <div className="voting-loader-card error">
          <p className="section-kicker">Error de carga</p>
          <h1>No se ha podido abrir esta votacion</h1>
          <p>{loadError || "Intentalo de nuevo dentro de un momento."}</p>
          <button className="button-next-back" onClick={() => navigate("/home")}>
            Volver a la home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="voting-shell">
      <section className="voting-header-card">
        <div>
          <p className="section-kicker">
            Categoria {currentIndex + 1} de {premioIds.length}
          </p>
          <h1 className="VotingTitle">{currentAwardName}</h1>
          <p className="subtitle">{getAwardDescription(premio)}</p>
        </div>

        <div className="score-card">
          <p className="score-card-label">{isPremium ? "Modo premium activo" : "Puntuacion activa"}</p>
          <strong>{scoreLegend}</strong>
          <span>El ultimo puesto no recibe puntos.</span>
        </div>
      </section>

      <div className="progress-bar" aria-hidden="true">
        {premioIds.map((_, index) => (
          <div key={index} className={`progress-dot ${currentIndex === index ? "active" : ""}`} />
        ))}
      </div>

      {feedback.text ? (
        <p className={`feedback-message ${feedback.type}`} aria-live="polite">
          {feedback.text}
        </p>
      ) : null}

      <div className="nominados-container">
        {nominados.map((nominado) => {
          const nomineeName = getNomineeName(nominado);
          const nomineeImage = getNomineeImage(nominado);
          const nomineeVideo = getNomineeVideo(nominado);
          const nomineeExtraImage = getNomineeExtraImage(nominado);

          return (
            <article key={nominado.id} className="nominado-card">
              <div className="nominado-image-wrapper">
                {nomineeImage ? (
                  <img src={nomineeImage} alt={nomineeName} />
                ) : (
                  <div className="nominado-placeholder">Sin imagen</div>
                )}
              </div>

              <div className="nominado-copy">
                <h2>{nomineeName}</h2>
                <div className="nominado-options">
                  {nomineeVideo ? (
                    <button className="videoButton" onClick={() => handleShowMedia(nomineeVideo, true)}>
                      Ver video
                    </button>
                  ) : null}
                  {nomineeExtraImage ? (
                    <button className="videoButton" onClick={() => handleShowMedia(nomineeExtraImage, false)}>
                      Ver imagen
                    </button>
                  ) : null}
                </div>
              </div>

              <label className="vote-field">
                <span>Posicion</span>
                <select
                  className="vote-select"
                  onChange={(event) => handleSelectVote(nominado.id, event.target.value)}
                  value={selectedVotes[nominado.id] || ""}
                >
                  <option value="">Selecciona</option>
                  {requiredPositions.map((position) => {
                    const points = getPointsForPosition(position, nominados.length, isPremium);

                    return (
                      <option key={`${nominado.id}-${position}`} value={position}>
                        {position}o puesto · {points} pts
                      </option>
                    );
                  })}
                </select>
              </label>
            </article>
          );
        })}
      </div>

      <div className="voting-footer">
        <div className="navigation-buttons">
          <button
            className="button-next-back"
            onClick={() => setCurrentIndex((previousIndex) => Math.max(previousIndex - 1, 0))}
            disabled={currentIndex === 0}
          >
            Categoria anterior
          </button>
          <button
            className="button-next-back"
            onClick={() =>
              setCurrentIndex((previousIndex) => Math.min(previousIndex + 1, premioIds.length - 1))
            }
            disabled={currentIndex === premioIds.length - 1}
          >
            Siguiente categoria
          </button>
        </div>

        <div className="voting-actions">
          <button className="button-voting" onClick={handleSubmitVotes} disabled={isSubmitting}>
            {isSubmitting ? "Guardando voto..." : "Guardar categoria"}
          </button>
          <button
            className="button-final-vote"
            onClick={() => navigate("/introfinal", { state: { accessMode, isPremium } })}
          >
            Ir al voto final
          </button>
        </div>
      </div>

      {showMediaModal ? (
        <div className="modal-overlay" onClick={handleCloseMedia}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close-button" onClick={handleCloseMedia}>
              Cerrar
            </button>
            <div className="modal-media-container">
              {isMediaVideo ? (
                <video id="modal-video" controls autoPlay preload="auto">
                  <source src={selectedMediaURL} type="video/mp4" />
                  Tu navegador no soporta el video.
                </video>
              ) : (
                <img src={selectedMediaURL} alt="Contenido del nominado" />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Voting;
