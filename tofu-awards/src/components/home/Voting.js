import React, { useEffect, useState } from "react";
import { db, auth } from "./../../firebase.js";
import { doc, getDoc, getDocs, collection, updateDoc, setDoc } from "firebase/firestore";
import './Voting.css';

const Voting = ({ premioIds }) => {
  const [premio, setPremio] = useState(null);
  const [nominados, setNominados] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const user = auth.currentUser;
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoURL, setSelectedVideoURL] = useState("");

  useEffect(() => {
    const fetchPremioAndNominados = async () => {
      setLoading(true);
      try {
        const premioDoc = await getDoc(doc(db, "premios", premioIds[currentIndex]));
        if (premioDoc.exists()) {
          const premioData = premioDoc.data();
          setPremio(premioData);
  
          const nominadosSnapshot = await getDocs(
            collection(doc(db, "premios", premioIds[currentIndex]), "nominados")
          );
          const nominadosList = nominadosSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setNominados(nominadosList);
          setSelectedVotes({});
        } else {
          console.log("No hay documento de premio encontrado");
        }
      } catch (error) {
        console.error("Error al obtener el premio:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPremioAndNominados();
  }, [currentIndex, premioIds]); // Solo actualiza al cambiar currentIndex o premioIds
  

  const handleSelectVote = (nominadoId, vote) => {
    setSelectedVotes((prevVotes) => ({
      ...prevVotes,
      [nominadoId]: vote
    }));
  };

  const calculatePoints = (position) => {
    if (position === "1") return 5;
    if (position === "2") return 3;
    if (position === "3") return 1;
    return 0;
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
        const points = calculatePoints(vote);
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

  if (loading) return <div>Cargando...</div>;
  if (!premio) return <div>No se encontró información del premio.</div>;

  const handleNext = () => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % premioIds.length);
      setTransitioning(false);
    }, 500); // Ajusta este tiempo al tiempo de transición en CSS
  };
  
  const handlePrev = () => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + premioIds.length) % premioIds.length);
      setTransitioning(false);
    }, 500);
  };

  const handleShowVideo = (videoURL) => {
    setSelectedVideoURL(videoURL);
    setShowVideoModal(true);
  };

  const handleCloseVideo = () => {
    setShowVideoModal(false);
    setSelectedVideoURL("");
  };

  return (
    <div className="voting-container">
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
      <h1 className="VotingTitle">{premio.nombre}</h1>
      <p className="subtitle">{premio.descripcion}</p>
      <div className={`nominados-container ${transitioning ? "transitioning" : ""}`}>        
        {nominados.length > 0 ? (
          nominados.map((nominado) => (
            <div key={nominado.id} className="nominado">
              <h2>{nominado.nombre}</h2>
              <img src={nominado.imageURL} alt={nominado.nombre} />
              <div className="nominado-options">
                {nominado.videoURL && (
                  <button className="videoButton" onClick={() => handleShowVideo(nominado.videoURL)}>
                    Ver Video
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
      <div className="navigation-buttons">
        <button className="button-next-back" onClick={handlePrev}>Atrás</button>
        <button className="button-next-back" onClick={handleNext}>Siguiente</button>
      </div>
      <button className="button-voting" onClick={handleSubmitVotes} style={{ marginTop: "20px" }}>
        Enviar Votos
      </button>

      {showVideoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-button" onClick={handleCloseVideo}>X</button>
            <video controls autoPlay className="modal-video">
              <source src={selectedVideoURL} type="video/mp4" />
              Tu navegador no soporta el video.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voting;
