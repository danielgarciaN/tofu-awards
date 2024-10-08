const admin = require("firebase-admin");
const serviceAccount = require("./SK.json"); // Reemplaza con la ruta a tu archivo de clave privada

// Inicializa la aplicación de Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Datos de ejemplo para importar
const dataToImport = {
  premios: [
    {
      nombre: "Premio Innovación",
      descripcion: "Premio al mejor avance tecnológico.",
      nominados: [
        {
          nombre: "Nominado Innovador 1",
          imageURL: "https://ejemplo.com/innovacion1.jpg",
          videoURL: "https://ejemplo.com/innovacion1.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Nominado Innovador 2",
          imageURL: "https://ejemplo.com/innovacion2.jpg",
          videoURL: "https://ejemplo.com/innovacion2.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Nominado Innovador 3",
          imageURL: "https://ejemplo.com/innovacion3.jpg",
          videoURL: "https://ejemplo.com/innovacion3.mp4",
          votes: 0,
          votedUsers: {}
        }
      ]
    },
    {
      nombre: "Premio Excelencia Artística",
      descripcion: "Reconocimiento a los mejores en las artes.",
      nominados: [
        {
          nombre: "Artista 1",
          imageURL: "https://ejemplo.com/artista1.jpg",
          videoURL: "https://ejemplo.com/artista1.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Artista 2",
          imageURL: "https://ejemplo.com/artista2.jpg",
          videoURL: "https://ejemplo.com/artista2.mp4",
          votes: 0,
          votedUsers: {}
        }
      ]
    },
    {
      nombre: "Premio Deporte del Año",
      descripcion: "Premio al mejor deportista del año.",
      nominados: [
        {
          nombre: "Deportista 1",
          imageURL: "https://ejemplo.com/deportista1.jpg",
          videoURL: "https://ejemplo.com/deportista1.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Deportista 2",
          imageURL: "https://ejemplo.com/deportista2.jpg",
          videoURL: "https://ejemplo.com/deportista2.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Deportista 3",
          imageURL: "https://ejemplo.com/deportista3.jpg",
          videoURL: "https://ejemplo.com/deportista3.mp4",
          votes: 0,
          votedUsers: {}
        }
      ]
    },
    {
      nombre: "Premio Liderazgo Social",
      descripcion: "Premio a las iniciativas que promueven el cambio social.",
      nominados: [
        {
          nombre: "Líder Social 1",
          imageURL: "https://ejemplo.com/lider1.jpg",
          videoURL: "https://ejemplo.com/lider1.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Líder Social 2",
          imageURL: "https://ejemplo.com/lider2.jpg",
          videoURL: "https://ejemplo.com/lider2.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Líder Social 3",
          imageURL: "https://ejemplo.com/lider3.jpg",
          videoURL: "https://ejemplo.com/lider3.mp4",
          votes: 0,
          votedUsers: {}
        }
      ]
    },
    {
      nombre: "Premio Mejor Película",
      descripcion: "Premio a la mejor película del año.",
      nominados: [
        {
          nombre: "Película 1",
          imageURL: "https://ejemplo.com/pelicula1.jpg",
          videoURL: "https://ejemplo.com/pelicula1.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Película 2",
          imageURL: "https://ejemplo.com/pelicula2.jpg",
          videoURL: "https://ejemplo.com/pelicula2.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Película 3",
          imageURL: "https://ejemplo.com/pelicula3.jpg",
          videoURL: "https://ejemplo.com/pelicula3.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Película 4",
          imageURL: "https://ejemplo.com/pelicula4.jpg",
          videoURL: "https://ejemplo.com/pelicula4.mp4",
          votes: 0,
          votedUsers: {}
        }
      ]
    }
  ]
};

// Función para importar datos
const importData = async () => {
  try {
    for (const premio of dataToImport.premios) {
      // Añade el premio a la colección 'premios'
      const premioRef = await db.collection('premios').add({
        nombre: premio.nombre,
        descripcion: premio.descripcion,
      });
      console.log(`Documento ${premioRef.id} añadido para el premio ${premio.nombre}`);

      for (const nominado of premio.nominados) {
        // Añade el nominado a la subcolección 'nominados'
        await db.collection('premios').doc(premioRef.id).collection('nominados').add({
          nombre: nominado.nombre,
          imageURL: nominado.imageURL,
          videoURL: nominado.videoURL,
          votes: nominado.votes,
          votedUsers: nominado.votedUsers,
        });
        console.log(`Nominado ${nominado.nombre} añadido al premio ${premio.nombre}`);
      }
    }
  } catch (error) {
    console.error("Error al añadir documento:", error);
  }
};

// Llama a la función para importar datos
importData();
