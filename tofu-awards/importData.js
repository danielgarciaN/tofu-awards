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
      nombre: "Premio a la Innovación Creativa",
      descripcion: "Reconocimiento a las ideas más innovadoras.",
      nominados: [
        {
          nombre: "Creativo de la Tecnología 1",
          imageURL: "https://ejemplo.com/creativo1.jpg",
          videoURL: "https://ejemplo.com/creativo1.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Creativo de la Tecnología 2",
          imageURL: "https://ejemplo.com/creativo2.jpg",
          videoURL: "https://ejemplo.com/creativo2.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Creativo de la Tecnología 3",
          imageURL: "https://ejemplo.com/creativo3.jpg",
          videoURL: "https://ejemplo.com/creativo3.mp4",
          votes: 0,
          votedUsers: {}
        }
      ]
    },
    {
      nombre: "Premio a la Excelencia en las Artes",
      descripcion: "Reconocimiento a los artistas que han destacado.",
      nominados: [
        {
          nombre: "Artista Visionario 1",
          imageURL: "https://ejemplo.com/artista1.jpg",
          videoURL: "https://ejemplo.com/artista1.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Artista Visionario 2",
          imageURL: "https://ejemplo.com/artista2.jpg",
          videoURL: "https://ejemplo.com/artista2.mp4",
          votes: 0,
          votedUsers: {}
        }
      ]
    },
    {
      nombre: "Premio al Mejor Atleta del Año",
      descripcion: "Reconocimiento al atleta que ha tenido un desempeño sobresaliente.",
      nominados: [
        {
          nombre: "Atleta Destacado 1",
          imageURL: "https://ejemplo.com/atleta1.jpg",
          videoURL: "https://ejemplo.com/atleta1.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Atleta Destacado 2",
          imageURL: "https://ejemplo.com/atleta2.jpg",
          videoURL: "https://ejemplo.com/atleta2.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Atleta Destacado 3",
          imageURL: "https://ejemplo.com/atleta3.jpg",
          videoURL: "https://ejemplo.com/atleta3.mp4",
          votes: 0,
          votedUsers: {}
        }
      ]
    },
    {
      nombre: "Premio a la Inspiración Social",
      descripcion: "Reconocimiento a quienes impulsan el cambio positivo en la sociedad.",
      nominados: [
        {
          nombre: "Inspirador Social 1",
          imageURL: "https://ejemplo.com/inspirador1.jpg",
          videoURL: "https://ejemplo.com/inspirador1.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Inspirador Social 2",
          imageURL: "https://ejemplo.com/inspirador2.jpg",
          videoURL: "https://ejemplo.com/inspirador2.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Inspirador Social 3",
          imageURL: "https://ejemplo.com/inspirador3.jpg",
          videoURL: "https://ejemplo.com/inspirador3.mp4",
          votes: 0,
          votedUsers: {}
        }
      ]
    },
    {
      nombre: "Premio a la Mejor Película del Año",
      descripcion: "Reconocimiento a las mejores producciones cinematográficas.",
      nominados: [
        {
          nombre: "Cinta Épica 1",
          imageURL: "https://ejemplo.com/pelicula1.jpg",
          videoURL: "https://ejemplo.com/pelicula1.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Cinta Épica 2",
          imageURL: "https://ejemplo.com/pelicula2.jpg",
          videoURL: "https://ejemplo.com/pelicula2.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Cinta Épica 3",
          imageURL: "https://ejemplo.com/pelicula3.jpg",
          videoURL: "https://ejemplo.com/pelicula3.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Cinta Épica 4",
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
