import React, { useEffect, useState } from "react";
import { db, auth } from "./../../firebase.js";
import { doc, getDoc, getDocs, collection, updateDoc, setDoc } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom"; // Importar useNavigate
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
  const location = useLocation();
  const navigate = useNavigate();
  const isPremium = location.state?.isPremium || false;

  useEffect(() => {
    const fetchPremioAndNominados = async () => {
      const premioId = premioIds[currentIndex];
      if (premiosData[premioId]) {
        setPremio(premiosData[premioId].premio);
        setNominados(premiosData[premioId].nominados);
        setLoading(false);
        setTimeout(() => setTransitioning(false), 500);
        return;
      }

      setLoading(true);
      try {
        const premioDoc = await getDoc(doc(db, "premios", premioId));
        if (premioDoc.exists()) {
          const premioData = premioDoc.data();
          const nominadosSnapshot = await getDocs(collection(doc(db, "premios", premioId), "nominados"));
          const nominadosList = nominadosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

          setPremiosData(prevData => ({
            ...prevData,
            [premioId]: { premio: premioData, nominados: nominadosList }
          }));

          setPremio(premioData);
          setNominados(nominadosList);
        }
      } catch (error) {
        console.error("Error al obtener el premio:", error);
      } finally {
        setLoading(false);
        setTimeout(() => setTransitioning(false), 500);
      }
    };

    if (transitioning) {
      fetchPremioAndNominados();
    }
  }, [currentIndex, premioIds, premiosData, transitioning]);

  const handleSelectVote = (nominadoId, vote) => {
    setSelectedVotes((prevVotes) => ({
      ...prevVotes,
      [nominadoId]: vote
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % premioIds.length);
    }, 500);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    setTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + premioIds.length) % premioIds.length);
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
    const usedVotes = Object.values(selectedVotes);
    const uniqueVotes = new Set(usedVotes);

    if (usedVotes.length !== nominados.length || usedVotes.length !== uniqueVotes.size) {
      alert("Debes asignar una puntuación única a cada nominado antes de enviar.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);

      for (const nominadoId in selectedVotes) {
        const vote = selectedVotes[nominadoId];
        const points = isPremium ? vote * 2 : vote;
        const nominadoRef = doc(db, "premios", premioIds[currentIndex], "nominados", nominadoId);

        const nominadoDoc = await getDoc(nominadoRef);
        const nominadoData = nominadoDoc.data();

        const updatedVotedUsers = {
          ...nominadoData.votedUsers,
          [user.uid]: {
            email: user.email,
            timestamp: new Date().toISOString(),
            vote: points
          }
        };

        const totalPoints = Object.values(updatedVotedUsers).reduce((sum, userVote) => sum + userVote.vote, 0);

        await updateDoc(nominadoRef, {
          votedUsers: updatedVotedUsers,
          votes: totalPoints
        });

        await setDoc(userDocRef, {
          [premio.nombre]: {
            [nominadoId]: points
          }
        }, { merge: true });
      }

      alert("¡Votos enviados con éxito!");
      setSelectedVotes({});
    } catch (error) {
      console.error("Error al registrar los votos:", error);
      alert("Error al registrar los votos. Intenta de nuevo.");
    }
  };

  const handleFinalVote = () => {
    navigate('/finalvote'); 
  };

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
        
        {loading ? (
          <div className="loading-container">Cargando...</div>
        ) : (
          <>
            <h1 className={`VotingTitle ${transitioning ? "transitioning" : ""}`}>
              {premio.nombre}
            </h1>
            <p className={`subtitle ${transitioning ? "transitioning" : ""}`}>
              {premio.descripcion}
            </p>
            <div className={`nominados-container ${transitioning ? "transitioning" : ""}`}>
              {nominados.length > 0 ? (
                  nominados.map((nominado) => (
                      <div key={nominado.id} className={`nominado ${transitioning ? "transitioning" : ""}`}>
                          <h2>{nominado.nombre}</h2>
                          <img src={nominado.imageURL} alt={nominado.nombre} className={transitioning ? "transitioning" : ""} />
                          <div className="nominado-options">
                              {nominado.videoURL && (
                                  <button className="videoButton" onClick={() => handleShowMedia(nominado.videoURL, true)}>
                                      Ver Video
                                  </button>
                              )}
                              {nominado.mediaImageURL && (
                                  <button className="videoButton" onClick={() => handleShowMedia(nominado.mediaImageURL, false)}>
                                      Ver Imagen
                                  </button>
                              )}
                              <select
                                  onChange={(e) => handleSelectVote(nominado.id, e.target.value)}
                                  value={selectedVotes[nominado.id] || "-"}
                              >
                                  <option value="-">-</option>
                                  {Array.from({ length: nominados.length }, (_, i) => (
                                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                                  ))}
                              </select>
                          </div>
                      </div>
                  ))
              ) : (
                  <div>No hay nominados disponibles.</div>
              )}
            </div>
          </>
        )}
        
        <div className="navigation-buttons">
            <button className="button-next-back" onClick={handlePrev}>Atrás</button>
            <button className="button-next-back" onClick={handleNext}>Siguiente</button>
        </div>
        
        <button className="button-voting" onClick={handleSubmitVotes} style={{ marginTop: "20px" }}>
            Enviar Votos
        </button>

        <div className="final-vote-button-container">
          <button className="button-final-vote" onClick={handleFinalVote} style={{ marginTop: "40px" }}>
              Votar Premio Final
          </button>
        </div>

        {showMediaModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close-button" onClick={handleCloseMedia}>X</button>
              <div className="modal-media-container">
                {isMediaVideo ? (
                  <video id="modal-video" controls autoPlay className="modal-media" preload="auto">
                    <source src={selectedMediaURL} type="video/mp4" />
                    Tu navegador no soporta el video.
                  </video>
                ) : (
                  <img src={selectedMediaURL} alt="Imagen del nominado" className="modal-media" />
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Voting;
