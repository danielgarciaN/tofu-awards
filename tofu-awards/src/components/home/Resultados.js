import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./../../firebase.js";
import "./Resultados.css";

const getAwardName = (award) => award?.nombre || award?.name || "Premio";
const getNomineeName = (nominee) => nominee?.nombre || nominee?.name || "Ganador";
const getNomineeImage = (nominee) => nominee?.imageURL || nominee?.imageUrl || nominee?.mediaUrl || "";

const Resultados = () => {
  const [ganadores, setGanadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGanadores = async () => {
      setLoading(true);

      try {
        const premiosSnapshot = await getDocs(collection(db, "premios"));
        const premios = premiosSnapshot.docs.map((snapshot) => ({
          id: snapshot.id,
          ...snapshot.data(),
        }));

        const ganadoresData = await Promise.all(
          premios.map(async (premio) => {
            const nominadosSnapshot = await getDocs(collection(db, "premios", premio.id, "nominados"));
            const nominados = nominadosSnapshot.docs.map((snapshot) => ({
              id: snapshot.id,
              ...snapshot.data(),
            }));

            if (nominados.length === 0) {
              return {
                premio: getAwardName(premio),
                empate: false,
                ganadores: [],
              };
            }

            const maxVotes = Math.max(...nominados.map((nominado) => nominado.votes || 0));
            const winners = nominados.filter((nominado) => (nominado.votes || 0) === maxVotes);

            return {
              premio: getAwardName(premio),
              empate: winners.length > 1,
              ganadores: winners.map((winner) => ({
                nombre: getNomineeName(winner),
                imageURL: getNomineeImage(winner),
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
    return (
      <div className="resultados-shell">
        <div className="resultados-empty">
          <p className="results-kicker">Resultados</p>
          <h1>Calculando el estado de la gala</h1>
          <p>Recopilando puntuaciones y desempates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resultados-shell">
      <section className="resultados-header">
        <p className="results-kicker">Panel protegido</p>
        <h1 className="ResultadosTitle">Marcador actual de Tofu Awards</h1>
        <p>
          Vista de control para revisar quien lidera cada premio con la puntuacion almacenada en
          Firestore.
        </p>
      </section>

      {ganadores.length > 0 ? (
        <div className="ganadores-list">
          {ganadores.map((ganadorData, index) => (
            <article key={`${ganadorData.premio}-${index}`} className="ganador-card">
              <h2 className="premio-title">{ganadorData.premio}</h2>
              {ganadorData.ganadores.length > 0 ? (
                ganadorData.empate ? (
                  <div>
                    <p className="empate-message">Empate provisional</p>
                    <div className="ganadores-empatados">
                      {ganadorData.ganadores.map((ganador, idx) => (
                        <div key={`${ganador.nombre}-${idx}`} className="ganador-info">
                          {ganador.imageURL ? (
                            <img src={ganador.imageURL} alt={ganador.nombre} className="ganador-image" />
                          ) : (
                            <div className="ganador-image placeholder" />
                          )}
                          <p className="ganador-name">{ganador.nombre}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="ganador-info">
                    {ganadorData.ganadores[0].imageURL ? (
                      <img
                        src={ganadorData.ganadores[0].imageURL}
                        alt={ganadorData.ganadores[0].nombre}
                        className="ganador-image"
                      />
                    ) : (
                      <div className="ganador-image placeholder" />
                    )}
                    <p className="ganador-name">{ganadorData.ganadores[0].nombre}</p>
                  </div>
                )
              ) : (
                <p className="no-ganadores">Todavia no hay votos suficientes para esta categoria.</p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="resultados-empty">
          <h2>No hay resultados disponibles</h2>
          <p>Aun no se han encontrado ganadores.</p>
        </div>
      )}
    </div>
  );
};

export default Resultados;
