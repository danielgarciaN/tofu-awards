import React, { useEffect, useState } from "react";
import { db } from "./../../firebase.js";
import { collection, getDocs } from "firebase/firestore";
import "./Resultados.css";

const Resultados = () => {
  const [ganadores, setGanadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGanadores = async () => {
      setLoading(true);
      try {
        const premiosSnapshot = await getDocs(collection(db, "premios"));
        const premios = premiosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const ganadoresData = await Promise.all(
          premios.map(async (premio) => {
            const nominadosSnapshot = await getDocs(
              collection(db, "premios", premio.id, "nominados")
            );

            const nominados = nominadosSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            if (nominados.length === 0) {
              return {
                premio: premio.nombre,
                empate: false,
                ganadores: [],
              };
            }

            // Encontrar el puntaje más alto
            const maxVotes = Math.max(...nominados.map((nominado) => nominado.votes || 0));

            // Filtrar nominados que tengan el puntaje más alto
            const ganadores = nominados.filter((nominado) => nominado.votes === maxVotes);

            return {
              premio: premio.nombre,
              empate: ganadores.length > 1,
              ganadores: ganadores.map((ganador) => ({
                nombre: ganador.nombre,
                imageURL: ganador.imageURL,
              })),
            };
          })
        );

        setGanadores(ganadoresData);
      } catch (error) {
        console.error("Error al obtener los ganadores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGanadores();
  }, []);

  if (loading) {
    return <div className="loading-container">Cargando resultados...</div>;
  }

  return (
    <div className="resultados-container">
      <h1 className="ResultadosTitle">Ganadores de los Premios Tofu</h1>
      {ganadores.length > 0 ? (
        <div className="ganadores-list">
          {ganadores.map((ganadorData, index) => (
            <div key={index} className="ganador-card">
              <h2 className="premio-title">{ganadorData.premio}</h2>
              {ganadorData.ganadores.length > 0 ? (
                ganadorData.empate ? (
                  <div>
                    <p className="empate-message">¡Empate!</p>
                    <div className="ganadores-empatados">
                      {ganadorData.ganadores.map((ganador, idx) => (
                        <div key={idx} className="ganador-info">
                          <img
                            src={ganador.imageURL}
                            alt={ganador.nombre}
                            className="ganador-image"
                          />
                          <p className="ganador-name">{ganador.nombre}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="ganador-info">
                    <img
                      src={ganadorData.ganadores[0].imageURL}
                      alt={ganadorData.ganadores[0].nombre}
                      className="ganador-image"
                    />
                    <p className="ganador-name">{ganadorData.ganadores[0].nombre}</p>
                  </div>
                )
              ) : (
                <p className="no-ganadores">No hay nominados en esta categoría.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="no-ganadores">No se encontraron ganadores aún.</p>
      )}
    </div>
  );
};

export default Resultados;
