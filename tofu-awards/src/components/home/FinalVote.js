import React, { useEffect, useState } from "react";
import { db, auth } from "./../../firebase.js";
import { doc, getDocs, collection, updateDoc, setDoc } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import './Voting.css'; // Reutiliza los estilos de Voting

const FinalVote = ({ finalNominados = [] }) => {
  const [selectedVotes, setSelectedVotes] = useState({ primero: "", segundo: "", tercero: "" });
  const [displayNominado, setDisplayNominado] = useState({ primero: null, segundo: null, tercero: null });
  const [transitioning, setTransitioning] = useState(false);
  const user = auth.currentUser;
  const location = useLocation();
  const isPremium = location.state?.isPremium || false;

  useEffect(() => {
    setTransitioning(true);
    setTimeout(() => setTransitioning(false), 500);

    // Update displayed nominado when any of the selections change
    setDisplayNominado({
      primero: finalNominados.find((nominado) => nominado.nombre === selectedVotes.primero) || null,
      segundo: finalNominados.find((nominado) => nominado.nombre === selectedVotes.segundo) || null,
      tercero: finalNominados.find((nominado) => nominado.nombre === selectedVotes.tercero) || null,
    });
  }, [selectedVotes, finalNominados]);

  const handleSelectVote = (position, value) => {
    // Ensure no duplicate votes
    if (Object.values(selectedVotes).includes(value)) {
      alert("No puedes votar a la misma persona dos veces.");
      return;
    }

    setSelectedVotes((prevVotes) => ({
      ...prevVotes,
      [position]: value,
    }));
  };

  const calculatePoints = (position) => {
    switch (position) {
      case "primero":
        return isPremium ? 10 : 5;
      case "segundo":
        return isPremium ? 6 : 3;
      case "tercero":
        return isPremium ? 2 : 1;
      default:
        return 0;
    }
  };

  const handleSubmitVotes = async () => {
    if (!selectedVotes.primero || !selectedVotes.segundo || !selectedVotes.tercero) {
      alert("Debes asignar un voto único a cada posición antes de enviar.");
      return;
    }

    try {
      for (const position in selectedVotes) {
        const nominadoName = selectedVotes[position];
        const points = calculatePoints(position);
        const nominadoDoc = finalNominados.find((nominado) => nominado.nombre === nominadoName);
        if (!nominadoDoc) {
          continue;
        }

        const nominadoRef = doc(db, "finalVote", nominadoDoc.id);

        const nominadoSnapshot = await getDocs(collection(db, "finalVote"));
        const nominadoData = nominadoSnapshot.docs.find((doc) => doc.id === nominadoDoc.id)?.data() || {};

        const updatedVotedUsers = {
          ...nominadoData.votedUsers,
          [user.uid]: {
            email: user.email,
            timestamp: new Date().toISOString(),
            vote: points,
          },
        };

        const totalPoints = Object.values(updatedVotedUsers).reduce((sum, userVote) => sum + userVote.vote, 0);

        await updateDoc(nominadoRef, {
          votedUsers: updatedVotedUsers,
          votes: totalPoints,
        });

        await setDoc(
          doc(db, "users", user.uid),
          {
            finalVote: {
              [nominadoDoc.nombre]: points,
            },
          },
          { merge: true }
        );
      }

      alert("¡Votos finales enviados con éxito!");
      setSelectedVotes({ primero: "", segundo: "", tercero: "" });
    } catch (error) {
      console.error("Error al registrar los votos finales:", error);
      alert("Error al registrar los votos. Intenta de nuevo.");
    }
  };

  return (
    <div className={`voting-container ${transitioning ? "transitioning" : ""}`}>
      <video autoPlay loop muted className="video-background">
        <source src={require('./../../assets/videos/overlay (2).mp4')} type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>

      <h1 className={`VotingTitle ${transitioning ? "transitioning" : ""}`}>
        Premio Tofu del Año 2024
      </h1>
      <div className="final-vote-container">
        <div className="vote-selection" style={{ marginBottom: "30px" }}>
          <label htmlFor="primero">Primer puesto:</label>
          <select
            id="primero"
            value={selectedVotes.primero}
            onChange={(e) => handleSelectVote("primero", e.target.value)}
          >
            <option value="">-</option>
            {finalNominados.length > 0 &&
              finalNominados.map((nominado) => (
                <option key={nominado.id} value={nominado.nombre}>
                  {nominado.nombre}
                </option>
              ))}
          </select>
          {displayNominado.primero && (
            <div className="nominado-display">
              <h2>{displayNominado.primero.nombre}</h2>
              <img src={displayNominado.primero.imageURL} alt={displayNominado.primero.nombre} />
            </div>
          )}
        </div>
        <div className="vote-selection" style={{ marginBottom: "30px" }}>
          <label htmlFor="segundo">Segundo puesto:</label>
          <select
            id="segundo"
            value={selectedVotes.segundo}
            onChange={(e) => handleSelectVote("segundo", e.target.value)}
          >
            <option value="">-</option>
            {finalNominados.length > 0 &&
              finalNominados.map((nominado) => (
                <option key={nominado.id} value={nominado.nombre}>
                  {nominado.nombre}
                </option>
              ))}
          </select>
          {displayNominado.segundo && (
            <div className="nominado-display">
              <h2>{displayNominado.segundo.nombre}</h2>
              <img src={displayNominado.segundo.imageURL} alt={displayNominado.segundo.nombre} />
            </div>
          )}
        </div>
        <div className="vote-selection" style={{ marginBottom: "30px" }}>
          <label htmlFor="tercero">Tercer puesto:</label>
          <select
            id="tercero"
            value={selectedVotes.tercero}
            onChange={(e) => handleSelectVote("tercero", e.target.value)}
          >
            <option value="">-</option>
            {finalNominados.length > 0 &&
              finalNominados.map((nominado) => (
                <option key={nominado.id} value={nominado.nombre}>
                  {nominado.nombre}
                </option>
              ))}
          </select>
          {displayNominado.tercero && (
            <div className="nominado-display">
              <h2>{displayNominado.tercero.nombre}</h2>
              <img src={displayNominado.tercero.imageURL} alt={displayNominado.tercero.nombre} />
            </div>
          )}
        </div>
      </div>

      <button className="button-voting" onClick={handleSubmitVotes} style={{ marginTop: "20px" }}>
        Enviar Votos Finales
      </button>
    </div>
  );
};

export default FinalVote;
