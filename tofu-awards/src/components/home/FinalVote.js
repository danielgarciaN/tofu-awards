import React, { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "./../../firebase.js";
import "./Voting.css";
import { getStoredAccessMode, isPremiumAccess } from "../../utils/accessMode";
import { getPointsBreakdown, getPointsForPosition } from "../../utils/voting";

const FINAL_AWARD_ID = "fcCXt3CVpErT99cSz5yw";
const FINAL_POSITIONS = [
  { key: "primero", label: "Primer puesto", rank: "1" },
  { key: "segundo", label: "Segundo puesto", rank: "2" },
  { key: "tercero", label: "Tercer puesto", rank: "3" },
];

const getNomineeName = (nominee) => nominee?.nombre || nominee?.name || "Nominado";
const getNomineeImage = (nominee) => nominee?.imageURL || nominee?.imageUrl || nominee?.mediaUrl || "";

const FinalVote = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const accessMode = location.state?.accessMode || getStoredAccessMode();
  const isPremium = isPremiumAccess(accessMode) || Boolean(location.state?.isPremium);
  const user = auth.currentUser;
  const [selectedVotes, setSelectedVotes] = useState({
    primero: "",
    segundo: "",
    tercero: "",
  });
  const [finalNominados, setFinalNominados] = useState([]);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scoreBreakdown = useMemo(() => getPointsBreakdown(3, isPremium), [isPremium]);
  const displayNominados = useMemo(
    () =>
      FINAL_POSITIONS.reduce((accumulator, position) => {
        accumulator[position.key] = finalNominados.find(
          (nominado) => getNomineeName(nominado) === selectedVotes[position.key]
        );
        return accumulator;
      }, {}),
    [finalNominados, selectedVotes]
  );

  useEffect(() => {
    let cancelled = false;

    const fetchNominados = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "premios", FINAL_AWARD_ID, "nominados"));
        const nominadosList = querySnapshot.docs.map((snapshot) => ({
          id: snapshot.id,
          ...snapshot.data(),
        }));

        if (!cancelled) {
          setFinalNominados(nominadosList);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error al obtener los nominados:", error);
          setFeedback({
            type: "error",
            text: "No hemos podido cargar los finalistas del Tofu del Ano.",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchNominados();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectVote = (position, value) => {
    const alreadyUsedByAnotherSlot = Object.entries(selectedVotes).some(
      ([key, currentValue]) => key !== position && currentValue === value && value
    );

    if (alreadyUsedByAnotherSlot) {
      setFeedback({
        type: "error",
        text: "Cada finalista solo puede ocupar una posicion del podio.",
      });
      return;
    }

    setSelectedVotes((previousVotes) => ({
      ...previousVotes,
      [position]: value,
    }));
    setFeedback({ type: "", text: "" });
  };

  const handleSubmitVotes = async () => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (Object.values(selectedVotes).some((value) => !value)) {
      setFeedback({
        type: "error",
        text: "Debes completar el podio entero antes de enviar el voto final.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const finalVotePayload = {};

      for (const position of FINAL_POSITIONS) {
        const nominadoName = selectedVotes[position.key];
        const nominadoDoc = finalNominados.find(
          (candidate) => getNomineeName(candidate) === nominadoName
        );

        if (!nominadoDoc) {
          continue;
        }

        const points = getPointsForPosition(position.rank, 3, isPremium);
        finalVotePayload[getNomineeName(nominadoDoc)] = points;

        const nominadoRef = doc(db, "premios", FINAL_AWARD_ID, "nominados", nominadoDoc.id);
        const nominadoSnapshot = await getDoc(nominadoRef);
        const nominadoData = nominadoSnapshot.data() || {};
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
        doc(db, "users", user.uid),
        {
          finalVote: finalVotePayload,
        },
        { merge: true }
      );

      navigate("/goodbye", { replace: true });
    } catch (error) {
      console.error("Error al registrar los votos finales:", error);
      setFeedback({
        type: "error",
        text: "No hemos podido guardar el voto final. Intentalo otra vez.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="voting-shell">
        <div className="voting-loader-card">
          <p className="section-kicker">Tofu del Ano</p>
          <h1>Cargando finalistas</h1>
          <p>Preparando el podio definitivo de la gala.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="voting-shell">
      <section className="voting-header-card final">
        <div>
          <p className="section-kicker">Voto final</p>
          <h1 className="VotingTitle">Tofu del Ano</h1>
          <p className="subtitle">
            Decide quien ha estado al nivel mas alto del grupo: mejor rendimiento, mejor trayectoria
            general y mayor capacidad de aparecer cuando el ano lo pedia.
          </p>
        </div>

        <div className="score-card">
          <p className="score-card-label">Reparto de puntos</p>
          <strong>
            {scoreBreakdown.map(({ position, points }) => `${position}o: ${points}`).join(" · ")}
          </strong>
          <span>Podio obligatorio. No repitas finalista.</span>
        </div>
      </section>

      {feedback.text ? (
        <p className={`feedback-message ${feedback.type}`} aria-live="polite">
          {feedback.text}
        </p>
      ) : null}

      <section className="final-vote-grid">
        {FINAL_POSITIONS.map((position) => {
          const selectedNominee = displayNominados[position.key];

          return (
            <article key={position.key} className="final-vote-card">
              <div className="final-vote-topline">
                <span>{position.label}</span>
                <strong>{getPointsForPosition(position.rank, 3, isPremium)} pts</strong>
              </div>

              <label className="vote-field">
                <span>Selecciona un finalista</span>
                <select
                  className="vote-select"
                  value={selectedVotes[position.key]}
                  onChange={(event) => handleSelectVote(position.key, event.target.value)}
                >
                  <option value="">Selecciona</option>
                  {finalNominados.map((nominado) => {
                    const nomineeName = getNomineeName(nominado);

                    return (
                      <option key={`${position.key}-${nominado.id}`} value={nomineeName}>
                        {nomineeName}
                      </option>
                    );
                  })}
                </select>
              </label>

              <div className="final-preview">
                {selectedNominee ? (
                  <>
                    <img src={getNomineeImage(selectedNominee)} alt={getNomineeName(selectedNominee)} />
                    <h2>{getNomineeName(selectedNominee)}</h2>
                  </>
                ) : (
                  <div className="nominado-placeholder compact">Tu seleccion aparecera aqui</div>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <div className="voting-actions centered">
        <button className="button-next-back" onClick={() => navigate("/introfinal", { state: { accessMode, isPremium } })}>
          Volver a la intro
        </button>
        <button className="button-voting" onClick={handleSubmitVotes} disabled={isSubmitting}>
          {isSubmitting ? "Guardando voto final..." : "Enviar voto final"}
        </button>
      </div>
    </div>
  );
};

export default FinalVote;
