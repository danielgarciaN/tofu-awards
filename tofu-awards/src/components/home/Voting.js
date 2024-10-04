import React, { useEffect, useState } from "react";
import { db } from "./../../firebase.js"; // Asegúrate de importar tu configuración de firebase
import { doc, getDoc, updateDoc, setDoc, increment } from "firebase/firestore"; // Importa increment
import { auth } from "./../../firebase.js"; // Asegúrate de importar tu autenticación de Firebase

const Voting = () => {
  const [premio, setPremio] = useState(null);
  const [selectedVote, setSelectedVote] = useState(null);
  const user = auth.currentUser; // Obtiene el usuario autenticado

  useEffect(() => {
    const fetchPremio = async () => {
      const premioDoc = await getDoc(doc(db, "premios", "premio1")); // Cambia "premio1" por el ID del premio que quieras mostrar
      if (premioDoc.exists()) {
        setPremio(premioDoc.data());
      } else {
        console.log("No hay documento de premio encontrado");
      }
    };
    fetchPremio();
  }, []);

  const handleVote = async (nominadoId) => {
    if (!user) {
      alert("Debes estar logueado para votar.");
      return;
    }

    // Guardar voto en la colección de usuarios
    const userVote = {
      [premio.nombre]: {
        [nominadoId]: selectedVote
      }
    };
    
    await setDoc(doc(db, "users", user.uid), userVote, { merge: true });

    // Actualizar el voto en el nominado
    const nominadoRef = doc(db, "premios", "premio1", "nominados", nominadoId);
    await updateDoc(nominadoRef, {
      votes: increment(1), // Usa increment aquí
      [`votedUsers.${user.uid}`]: {
        email: user.email,
        timestamp: new Date().toISOString(),
        vote: selectedVote
      }
    });

    alert("Voto registrado con éxito!");
    setSelectedVote(null); // Reinicia el voto seleccionado después de votar
  };

  if (!premio) return <div>Cargando...</div>;

  return (
    <div>
      <h1>{premio.nombre}</h1>
      <p>{premio.descripcion}</p>
      <div>
        {Object.entries(premio.nominados).map(([nominadoId, nominado]) => (
          <div key={nominadoId}>
            <h2>{nominado.nombre}</h2>
            <img src={nominado.imageURL} alt={nominado.nombre} />
            <button onClick={() => setSelectedVote(1)}>1</button>
            <button onClick={() => setSelectedVote(2)}>2</button>
            <button onClick={() => setSelectedVote(3)}>3</button>
            <button onClick={() => setSelectedVote(4)}>4</button>
            <button onClick={() => handleVote(nominadoId)}>Votar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Voting;
