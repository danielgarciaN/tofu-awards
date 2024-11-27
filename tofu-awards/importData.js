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
      nombre: "Premio Tofu Del Año",
      descripcion: "Este premio reconoce a la persona que más ha destacado en la categoría del tofu en este año.",
      nominados: [
        {
          nombre: "Pau Molinero",
          imageURL: "https://ejemplo.com/pau_molinero.jpg",
          videoURL: "https://ejemplo.com/pau_molinero.mp4",
          mediaImageURL: "https://ejemplo.com/pau_molinero_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Albert Perez",
          imageURL: "https://ejemplo.com/albert_perez.jpg",
          videoURL: "https://ejemplo.com/albert_perez.mp4",
          mediaImageURL: "https://ejemplo.com/albert_perez_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Marc Duran",
          imageURL: "https://ejemplo.com/marc_duran.jpg",
          videoURL: "https://ejemplo.com/marc_duran.mp4",
          mediaImageURL: "https://ejemplo.com/marc_duran_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Xavi Perez",
          imageURL: "https://ejemplo.com/xavi_perez.jpg",
          videoURL: "https://ejemplo.com/xavi_perez.mp4",
          mediaImageURL: "https://ejemplo.com/xavi_perez_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Carla Fuentes",
          imageURL: "https://ejemplo.com/carla_fuentes.jpg",
          videoURL: "https://ejemplo.com/carla_fuentes.mp4",
          mediaImageURL: "https://ejemplo.com/carla_fuentes_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Anna Araguas",
          imageURL: "https://ejemplo.com/anna_araguas.jpg",
          videoURL: "https://ejemplo.com/anna_araguas.mp4",
          mediaImageURL: "https://ejemplo.com/anna_araguas_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Arlet Ferrer",
          imageURL: "https://ejemplo.com/arlet_ferrer.jpg",
          videoURL: "https://ejemplo.com/arlet_ferrer.mp4",
          mediaImageURL: "https://ejemplo.com/arlet_ferrer_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Jairo Rodriguez",
          imageURL: "https://ejemplo.com/jairo_rodriguez.jpg",
          videoURL: "https://ejemplo.com/jairo_rodriguez.mp4",
          mediaImageURL: "https://ejemplo.com/jairo_rodriguez_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Joel Miranda",
          imageURL: "https://ejemplo.com/joel_miranda.jpg",
          videoURL: "https://ejemplo.com/joel_miranda.mp4",
          mediaImageURL: "https://ejemplo.com/joel_miranda_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Ari Parera",
          imageURL: "https://ejemplo.com/ari_parera.jpg",
          videoURL: "https://ejemplo.com/ari_parera.mp4",
          mediaImageURL: "https://ejemplo.com/ari_parera_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Miriam Rodrigo",
          imageURL: "https://ejemplo.com/miriam_rodrigo.jpg",
          videoURL: "https://ejemplo.com/miriam_rodrigo.mp4",
          mediaImageURL: "https://ejemplo.com/miriam_rodrigo_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Daniel Garcia",
          imageURL: "https://ejemplo.com/daniel_garcia.jpg",
          videoURL: "https://ejemplo.com/daniel_garcia.mp4",
          mediaImageURL: "https://ejemplo.com/daniel_garcia_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Marti Molinero",
          imageURL: "https://ejemplo.com/marti_molinero.jpg",
          videoURL: "https://ejemplo.com/marti_molinero.mp4",
          mediaImageURL: "https://ejemplo.com/marti_molinero_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Isaac Oliver",
          imageURL: "https://ejemplo.com/isaac_oliver.jpg",
          videoURL: "https://ejemplo.com/isaac_oliver.mp4",
          mediaImageURL: "https://ejemplo.com/isaac_oliver_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Marti Benet",
          imageURL: "https://ejemplo.com/marti_benet.jpg",
          videoURL: "https://ejemplo.com/marti_benet.mp4",
          mediaImageURL: "https://ejemplo.com/marti_benet_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Gerard Espinosa",
          imageURL: "https://ejemplo.com/gerard_espinosa.jpg",
          videoURL: "https://ejemplo.com/gerard_espinosa.mp4",
          mediaImageURL: "https://ejemplo.com/gerard_espinosa_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "David Sender",
          imageURL: "https://ejemplo.com/david_sender.jpg",
          videoURL: "https://ejemplo.com/david_sender.mp4",
          mediaImageURL: "https://ejemplo.com/david_sender_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Alex Sender",
          imageURL: "https://ejemplo.com/alex_sender.jpg",
          videoURL: "https://ejemplo.com/alex_sender.mp4",
          mediaImageURL: "https://ejemplo.com/alex_sender_media.jpg",
          votes: 0,
          votedUsers: {}
        },
        {
          nombre: "Victor Sender",
          imageURL: "https://ejemplo.com/victor_sender.jpg",
          videoURL: "https://ejemplo.com/victor_sender.mp4",
          mediaImageURL: "https://ejemplo.com/victor_sender_media.jpg",
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
          mediaImageURL: nominado.mediaImageURL,
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
