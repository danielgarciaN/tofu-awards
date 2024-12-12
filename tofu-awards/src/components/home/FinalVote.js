import React, { useEffect, useState } from "react";
import { db, auth } from "./../../firebase.js";
import { collection, getDocs, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import './Voting.css';

const FinalVote = () => {
  const [selectedVotes, setSelectedVotes] = useState({ primero: "", segundo: "", tercero: "" });
  const [finalNominados, setFinalNominados] = useState([]);
  const [displayNominados, setDisplayNominados] = useState({});
  const [transitioning, setTransitioning] = useState(false);
  const [message, setMessage] = useState(""); // Estado para el mensaje
  const user = auth.currentUser;
  const location = useLocation();
  const navigate = useNavigate();
  const isPremium = location.state?.isPremium || false;

  useEffect(() => {
    const fetchNominados = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "premios", "fcCXt3CVpErT99cSz5yw", "nominados"));
        const nominadosList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFinalNominados(nominadosList);
      } catch (error) {
        console.error("Error al obtener los nominados:", error);
      }
    };

    fetchNominados();
  }, []);

  useEffect(() => {
    const newDisplayNominados = {
      primero: finalNominados.find(nominado => nominado.nombre === selectedVotes.primero),
      segundo: finalNominados.find(nominado => nominado.nombre === selectedVotes.segundo),
      tercero: finalNominados.find(nominado => nominado.nombre === selectedVotes.tercero),
    };
    setDisplayNominados(newDisplayNominados);
  }, [selectedVotes, finalNominados]);

  const handleSelectVote = (position, value) => {
    if (Object.values(selectedVotes).includes(value)) {
      setMessage("No puedes votar a la misma persona dos veces.");
      return;
    }

    setSelectedVotes(prevVotes => ({
      ...prevVotes,
      [position]: value,
    }));
    setMessage(""); // Limpia el mensaje al seleccionar correctamente
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
      setMessage("Debes asignar un voto único a cada posición antes de enviar.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);

      for (const position in selectedVotes) {
        const nominadoName = selectedVotes[position];
        const points = calculatePoints(position);
        const nominadoDoc = finalNominados.find(nominado => nominado.nombre === nominadoName);
        if (!nominadoDoc) {
          continue;
        }

        const nominadoRef = doc(db, "premios", "fcCXt3CVpErT99cSz5yw", "nominados", nominadoDoc.id);

        const nominadoSnapshot = await getDoc(nominadoRef);
        const nominadoData = nominadoSnapshot.data();

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
          userDocRef,
          {
            finalVote: {
              [nominadoDoc.nombre]: points,
            },
          },
          { merge: true }
        );
      }

      setMessage("¡Votos finales enviados con éxito!");
      setSelectedVotes({ primero: "", segundo: "", tercero: "" });

      // Redirigir a la página de despedida después de enviar los votos finales
      navigate('/goodbye');
    } catch (error) {
      console.error("Error al registrar los votos finales:", error);
      setMessage("Error al registrar los votos. Intenta de nuevo.");
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

      {message && <p className="message">{message}</p>} {/* Mostrar mensajes */}

      <div className="final-vote-container">
        <div className="vote-selection" style={{ marginBottom: "20px", display: "flex", alignItems: "center", fontSize: "30px", marginLeft: "40px" }}>
          <label htmlFor="primero" style={{ flex: "1", whiteSpace: "nowrap", marginRight: "10px" }}>Primer puesto:</label>
          <select
            id="primero"
            value={selectedVotes.primero}
            onChange={(e) => handleSelectVote("primero", e.target.value)}
            className="vote-select"
            style={{ flex: "1" }}
          >
            <option value="">-</option>
            {finalNominados.map((nominado) => (
              <option key={nominado.id} value={nominado.nombre}>
                {nominado.nombre}
              </option>
            ))}
          </select>
          {selectedVotes.primero && (
            <div className={`nominado-display ${transitioning ? "transitioning" : ""}`} style={{ flex: "1", textAlign: "right" }}>
              <img
                src={displayNominados.primero?.imageURL}
                alt={selectedVotes.primero}
                className="nominado-image-primero"
              />
            </div>
          )}
        </div>

        {/* Segundo y Tercer puesto secciones */}
        <div className="vote-selection" style={{ marginBottom: "20px", display: "flex", alignItems: "center", fontSize: "30px", marginLeft: "40px" }}>
          <label htmlFor="segundo" style={{ flex: "1", whiteSpace: "nowrap", marginRight: "10px" }}>Segundo puesto:</label>
          <select
            id="segundo"
            value={selectedVotes.segundo}
            onChange={(e) => handleSelectVote("segundo", e.target.value)}
            className="vote-select"
            style={{ flex: "1" }}
          >
            <option value="">-</option>
            {finalNominados.map((nominado) => (
              <option key={nominado.id} value={nominado.nombre}>
                {nominado.nombre}
              </option>
            ))}
          </select>
          {selectedVotes.segundo && (
            <div className={`nominado-display ${transitioning ? "transitioning" : ""}`} style={{ flex: "1", textAlign: "right" }}>
              <img
                src={displayNominados.segundo?.imageURL}
                alt={selectedVotes.segundo}
                className="nominado-image"
              />
            </div>
          )}
        </div>

        <div className="vote-selection" style={{ marginBottom: "20px", display: "flex", alignItems: "center", fontSize: "30px", marginLeft: "40px" }}>
          <label htmlFor="tercero" style={{ flex: "1", whiteSpace: "nowrap", marginRight: "10px" }}>Tercer puesto:</label>
          <select
            id="tercero"
            value={selectedVotes.tercero}
            onChange={(e) => handleSelectVote("tercero", e.target.value)}
            className="vote-select"
            style={{ flex: "1" }}
          >
            <option value="">-</option>
            {finalNominados.map((nominado) => (
              <option key={nominado.id} value={nominado.nombre}>
                {nominado.nombre}
              </option>
            ))}
          </select>
          {selectedVotes.tercero && (
            <div className={`nominado-display ${transitioning ? "transitioning" : ""}`} style={{ flex: "1", textAlign: "right" }}>
              <img
                src={displayNominados.tercero?.imageURL}
                alt={selectedVotes.tercero}
                className="nominado-image"
              />
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
