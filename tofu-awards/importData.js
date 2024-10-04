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
      nombre: "Premio A",
      descripcion: "Descripción del Premio A",
      nominados: [
        {
          nombre: "Nominado 1",
          imageURL: "https://ejemplo.com/image1.jpg",
          videoURL: "https://ejemplo.com/video1.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Nominado 2",
          imageURL: "https://ejemplo.com/image2.jpg",
          videoURL: "https://ejemplo.com/video2.mp4",
          votes: 0,
          votedUsers: {}
        }
      ]
    },
    {
      nombre: "Premio B",
      descripcion: "Descripción del Premio B",
      nominados: [
        {
          nombre: "Nominado 3",
          imageURL: "https://ejemplo.com/image3.jpg",
          videoURL: "https://ejemplo.com/video3.mp4",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Nominado 4",
          imageURL: "https://ejemplo.com/image4.jpg",
          videoURL: "https://ejemplo.com/video4.mp4",
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
