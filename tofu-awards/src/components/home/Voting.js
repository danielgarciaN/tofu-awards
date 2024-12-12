import React, { useEffect, useState } from "react";
import { db, auth } from "./../../firebase.js";
import { doc, getDoc, getDocs, collection, updateDoc, setDoc } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import './Voting.css';

const Voting = ({ premioIds }) => {
  const [premio, setPremio] = useState(null);
  const [nominados, setNominados] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [premiosData, setPremiosData] = useState({});
  const user = auth.currentUser;
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMediaURL, setSelectedMediaURL] = useState("");
  const [isMediaVideo, setIsMediaVideo] = useState(false);
  const [message, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const isPremium = location.state?.isPremium || false;

  const fetchPremioAndNominados = async () => {
    setLoading(true);
    const premioId = premioIds[currentIndex];
    setMessage(""); // Limpia el mensaje al cambiar de premio

    if (premiosData[premioId]) {
      setPremio(premiosData[premioId].premio);
      setNominados(premiosData[premioId].nominados);
      setLoading(false);
      setTransitioning(false);
      return;
    }

    try {
      const premioDoc = await getDoc(doc(db, "premios", premioId));
      if (premioDoc.exists()) {
        const premioData = premioDoc.data();
        const nominadosSnapshot = await getDocs(collection(doc(db, "premios", premioId), "nominados"));
        const nominadosList = nominadosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        setPremiosData((prevData) => ({
          ...prevData,
          [premioId]: { premio: premioData, nominados: nominadosList }
        }));

        setPremio(premioData);
        setNominados(nominadosList);
      } else {
        console.error(`El premio con ID ${premioId} no existe.`);
      }
    } catch (error) {
      console.error("Error al cargar el premio:", error);
    } finally {
      setLoading(false);
      setTransitioning(false);
    }
  };

  useEffect(() => {
    fetchPremioAndNominados();
  }, [currentIndex]);

  const handleSelectVote = (nominadoId, vote) => {
    setSelectedVotes((prevVotes) => ({
      ...prevVotes,
      [nominadoId]: vote
    }));
  };

  const handleNext = () => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % premioIds.length);
      setPremio(null);
      setNominados([]);
    }, 500);
  };

  const handlePrev = () => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + premioIds.length) % premioIds.length);
      setPremio(null);
      setNominados([]);
    }, 500);
  };

  const handleShowMedia = (mediaURL, isVideo) => {
    setSelectedMediaURL(mediaURL);
    setIsMediaVideo(isVideo);
    setShowMediaModal(true);
    if (isVideo) {
      setTimeout(() => {
        const videoElement = document.getElementById("modal-video");
        if (videoElement) {
          videoElement.play();
        }
      }, 200);
    }
  };

  const handleCloseMedia = () => {
    setShowMediaModal(false);
    setSelectedMediaURL("");
  };

  const handleSubmitVotes = async () => {
    setMessage("");
    const usedVotes = Object.values(selectedVotes);
    const uniqueVotes = new Set(usedVotes);
    const isFourNominados = nominados.length === 4;

    if (
      (isFourNominados && (usedVotes.length !== 4 || uniqueVotes.size !== 4 || !["1", "2", "3", "4"].every((pos) => usedVotes.includes(pos)))) ||
      (!isFourNominados && (usedVotes.length !== 3 || uniqueVotes.size !== 3 || !["1", "2", "3"].every((pos) => usedVotes.includes(pos))))
    ) {
      setMessage(`Debes seleccionar un ${isFourNominados ? "1er, 2do, 3er y 4to" : "1er, 2do y 3er"} puesto antes de enviar.`);
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);

      for (const nominadoId in selectedVotes) {
        const votePosition = selectedVotes[nominadoId];
        let points;

        switch (votePosition) {
          case "1":
            points = 5;
            break;
          case "2":
            points = 3;
            break;
          case "3":
            points = 1;
            break;
          case "4":
            points = isFourNominados ? 0 : undefined; // Solo aplica si hay 4 nominados
            break;
          default:
            points = 0;
        }

        if (isPremium) {
          points *= 2;
        }

        const nominadoRef = doc(db, "premios", premioIds[currentIndex], "nominados", nominadoId);

        const nominadoDoc = await getDoc(nominadoRef);
        const nominadoData = nominadoDoc.data();

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
            [premio.nombre]: {
              [nominadoId]: points,
            },
          },
          { merge: true }
        );
      }

      setMessage("¡Votos enviados con éxito!");
      setSelectedVotes({});
    } catch (error) {
      console.error("Error al registrar los votos:", error);
      setMessage("Error al registrar los votos. Intenta de nuevo.");
    }
  };

  const handleFinalVote = () => {
    navigate("/introfinal");
  };

  if (loading || !premio) {
    return <div className="loading-container" style={{ backgroundColor: "black", color: "white" }}>Cargando...</div>;
  }

  return (
    <div className={`voting-container ${transitioning ? "transitioning" : ""}`}>
      <video autoPlay loop muted className="video-background">
        <source src={require('./../../assets/videos/overlay (2).mp4')} type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>

      <div className="progress-bar">
        {premioIds.map((_, index) => (
          <div
            key={index}
            className={`progress-dot ${currentIndex === index ? "active" : ""}`}
          ></div>
        ))}
      </div>

      <h1 className={`VotingTitle ${transitioning ? "transitioning" : ""}`}>{premio.nombre}</h1>
      <p className={`subtitle ${transitioning ? "transitioning" : ""}`}>{premio.descripcion}</p>

      <div className={`nominados-container ${transitioning ? "transitioning" : ""}`}>
        {nominados.map((nominado) => (
          <div key={nominado.id} className={`nominado ${transitioning ? "transitioning" : ""}`}>
            <h2>{nominado.nombre}</h2>
            <img
              src={nominado.imageURL}
              alt={nominado.nombre}
              className={transitioning ? "transitioning" : ""}
            />
            <div className="nominado-options">
              {nominado.videoURL && (
                <button
                  className="videoButton"
                  onClick={() => handleShowMedia(nominado.videoURL, true)}
                >
                  Ver Video
                </button>
              )}
              {nominado.mediaImageURL && (
                <button
                  className="videoButton"
                  onClick={() => handleShowMedia(nominado.mediaImageURL, false)}
                >
                  Ver Imagen
                </button>
              )}
              <select
                className="vote-select"
                onChange={(e) => handleSelectVote(nominado.id, e.target.value)}
                value={selectedVotes[nominado.id] || "-"}
              >
                <option value="-">-</option>
                {["1", "2", "3", "4"].map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="navigation-buttons">
        <button className="button-next-back" onClick={handlePrev}>Atrás</button>
        <button className="button-next-back" onClick={handleNext}>Siguiente</button>
      </div>

      <button className="button-voting" onClick={handleSubmitVotes} style={{ marginTop: "20px" }}>
        Enviar Votos
      </button>

      <div className="final-vote-button-container">
        {/* Mensaje con espacio reservado */}
        <p className={`message ${message ? "visible" : ""}`}>
          {message}
        </p>

        {/* Botón fijo */}
        <button className="button-final-vote" onClick={handleFinalVote}>
          Votar Premio Final
        </button>
      </div>

      {showMediaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-button" onClick={handleCloseMedia}>
              X
            </button>
            <div className="modal-media-container">
              {isMediaVideo ? (
                <video id="modal-video" controls autoPlay preload="auto">
                  <source src={selectedMediaURL} type="video/mp4" />
                  Tu navegador no soporta el video.
                </video>
              ) : (
                <img src={selectedMediaURL} alt="Imagen del nominado" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voting;
