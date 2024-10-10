import React, { useEffect, useState } from "react";
import { db, auth } from "./../../firebase.js";
import { doc, getDoc, getDocs, collection, updateDoc, setDoc } from "firebase/firestore";
import './Voting.css'; // Importa el archivo CSS

const Voting = ({ premioIds }) => {
  const [premio, setPremio] = useState(null);
  const [nominados, setNominados] = useState([]); // Estado para los nominados
  const [selectedVotes, setSelectedVotes] = useState({}); // Guardar los votos seleccionados
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const [currentIndex, setCurrentIndex] = useState(0); // Índice del premio actual
  const user = auth.currentUser; // Obtiene el usuario autenticado
  const [showVideoModal, setShowVideoModal] = useState(false); // Estado para mostrar/ocultar el modal
  const [selectedVideoURL, setSelectedVideoURL] = useState(""); // Estado para almacenar la URL del video seleccionado

  useEffect(() => {
    const fetchPremioAndNominados = async () => {
      setLoading(true);
      try {
        const premioDoc = await getDoc(doc(db, "premios", premioIds[currentIndex]));
        if (premioDoc.exists()) {
          const premioData = premioDoc.data();
          setPremio(premioData);

          // Obtener nominados
          const nominadosSnapshot = await getDocs(collection(doc(db, "premios", premioIds[currentIndex]), "nominados"));
          const nominadosList = nominadosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setNominados(nominadosList);

          // Resetear los votos cuando se cambia de premio
          setSelectedVotes({}); // Limpiar los votos anteriores
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
  }, [currentIndex, premioIds]);

  // Función para seleccionar un voto
  const handleSelectVote = (nominadoId, vote) => {
    setSelectedVotes((prevVotes) => ({
      ...prevVotes,
      [nominadoId]: vote
    }));
  };

  // Función para calcular la suma total de puntos
  const calculateTotalPoints = (votes) => {
    const pointsMap = {
      1: 5,
      2: 3,
      3: 1,
      4: 0
    };

    return Object.values(votes).reduce((total, vote) => total + (pointsMap[vote] || 0), 0);
  };

  // Función para enviar los votos
  const handleSubmitVotes = async () => {
    const usedVotes = Object.values(selectedVotes);
    const uniqueVotes = new Set(usedVotes);

    // Validar que se haya votado en el premio actual y que no se repitan puntuaciones
    if (usedVotes.length !== nominados.length || usedVotes.length !== uniqueVotes.size) {
      alert("Debes asignar una puntuación única a cada nominado antes de enviar.");
      return; // Detener el envío si hay puntuaciones duplicadas o si faltan votos
    }

    try {
      const userDocRef = doc(db, "users", user.uid);

      for (const nominadoId in selectedVotes) {
        const vote = selectedVotes[nominadoId];
        const points = vote === "-" ? 0 : (5 - (vote - 1) * 2); // Calcular puntos (5, 3, 1, o 0)
        const nominadoRef = doc(db, "premios", premioIds[currentIndex], "nominados", nominadoId);

        // Obtener los datos actuales del nominado, incluyendo los votos anteriores
        const nominadoDoc = await getDoc(nominadoRef);
        const nominadoData = nominadoDoc.data();

        // Actualizamos el campo `votedUsers` con el nuevo voto del usuario
        const updatedVotedUsers = {
          ...nominadoData.votedUsers,
          [user.uid]: {
            email: user.email,
            timestamp: new Date().toISOString(),
            vote: points // Guardamos el puntaje calculado
          }
        };

        // Recalculamos el total de puntos basado en `votedUsers`
        const totalPoints = calculateTotalPoints(updatedVotedUsers);

        // Actualizamos el documento del nominado con los nuevos votos y el total actualizado
        await updateDoc(nominadoRef, {
          votedUsers: updatedVotedUsers,
          votes: totalPoints // Suma total de votos
        });

        // También actualizamos el documento del usuario para registrar su voto
        await setDoc(userDocRef, {
          [premio.nombre]: {
            [nominadoId]: points // Guardamos el puntaje
          }
        }, { merge: true });
      }

      alert("¡Votos enviados con éxito!");
      setSelectedVotes({}); // Resetear los votos seleccionados después de enviarlos

    } catch (error) {
      console.error("Error al registrar los votos:", error);
      alert("Error al registrar los votos. Intenta de nuevo.");
    }
  };

  // Manejo de la carga
  if (loading) return <div>Cargando...</div>;
  if (!premio) return <div>No se encontró información del premio.</div>;

  // Navegación
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % premioIds.length); // Vuelve al inicio si se excede
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + premioIds.length) % premioIds.length); // Va al final si se vuelve al inicio
  };

  // Función para abrir el modal con el video seleccionado
  const handleShowVideo = (videoURL) => {
    setSelectedVideoURL(videoURL); // Establece la URL del video seleccionado
    setShowVideoModal(true); // Muestra el modal
  };

  // Función para cerrar el modal
  const handleCloseVideo = () => {
    setShowVideoModal(false); // Oculta el modal
    setSelectedVideoURL(""); // Limpia la URL del video
  };

  return (
    <div className="voting-container">
      <video autoPlay loop muted className="video-background">
        <source src={require('./../../assets/videos/overlay4.mp4')} type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>
      <h1 className="VotingTitle">{premio.nombre}</h1>
      <p className="subtitle">{premio.descripcion}</p>
      <div className="nominados-container">
        {nominados.length > 0 ? (
          nominados.map((nominado) => (
            <div key={nominado.id} className="nominado">
              <h2>{nominado.nombre}</h2>
              <img src={nominado.imageURL} alt={nominado.nombre} />
              {nominado.videoURL && (
                <div>
                  <button className="videoButton" onClick={() => handleShowVideo(nominado.videoURL)}>
                    Ver Video
                  </button>
                </div>
              )}
              <div>
                <select 
                  onChange={(e) => handleSelectVote(nominado.id, e.target.value)} 
                  value={selectedVotes[nominado.id] || "-"}
                >
                  <option value="-">-</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
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

      {/* Modal para mostrar el video */}
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
