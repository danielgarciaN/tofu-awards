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

  // Función para calcular el total de votos sumando los votos de todos los usuarios en `votedUsers`
  const calculateTotalVotes = (votedUsers) => {
    return Object.values(votedUsers).reduce((total, user) => total + user.vote, 0);
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
            vote
          }
        };

        // Recalculamos el total de votos basado en `votedUsers`
        const totalVotes = calculateTotalVotes(updatedVotedUsers);

        // Actualizamos el documento del nominado con los nuevos votos y el total actualizado
        await updateDoc(nominadoRef, {
          votedUsers: updatedVotedUsers,
          votes: totalVotes
        });

        // También actualizamos el documento del usuario para registrar su voto
        await setDoc(userDocRef, {
          [premio.nombre]: {
            [nominadoId]: vote
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

  return (
    <div className="voting-container">
      <h1>{premio.nombre}</h1>
      <p>{premio.descripcion}</p>
      <div className="nominados-container">
        {nominados.length > 0 ? (
          nominados.map((nominado) => (
            <div key={nominado.id} className="nominado">
              <h2>{nominado.nombre}</h2>
              <img src={nominado.imageURL} alt={nominado.nombre} />
              {nominado.videoURL && (
                <div>
                  <a href={nominado.videoURL} target="_blank" rel="noopener noreferrer">
                    Ver Video
                  </a>
                </div>
              )}
              <div>
                {[1, 2, 3, 4].map((vote) => (
                  <button
                    key={vote}
                    onClick={() => handleSelectVote(nominado.id, vote)}
                    className={`vote-button ${selectedVotes[nominado.id] === vote ? 'selected' : ''}`}
                  >
                    {vote}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div>No hay nominados disponibles.</div>
        )}
      </div>
      <div className="navigation-buttons">
        <button onClick={handlePrev}>Atrás</button>
        <button onClick={handleNext}>Siguiente</button>
      </div>
      <button onClick={handleSubmitVotes} style={{ marginTop: "20px" }}>
        Enviar Votos
      </button>
    </div>
  );
};

export default Voting;
