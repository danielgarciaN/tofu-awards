const admin = require("firebase-admin");
const serviceAccount = require("./SK.json"); // Reemplaza con la ruta a tu archivo de clave privada

// Inicializa la aplicación de Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Datos de ejemplo para importar
const dataToImport = 
{ premios: [
{
  nombre: "Tofu del Año",
  descripcion: "Premia al individuo que más ha destacado en todas las categorías combinadas, representando el espíritu del grupo y el impacto positivo en el año.",
  nominados: [
    {
      nombre: "Pau Molinero",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "Albert Perez",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "Marc Duran",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "Xavi Perez",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "Carla Fuentes",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "Anna Araguas",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "Arlet Ferrer",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "Gerard Espinosa",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "Joel Miranda",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "Jairo Rodriguez",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "Miriam Rodrigo",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "Daniel García",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "Marti Molinero",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "Isaac Oliver",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "David Sender",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "Alex Sender",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "Victor Sender",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "Ari Parera",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
    {
      nombre: "Marti Benet",
      imageURL: "",
      videoURL: "",
      mediaImageURL: "",
      votes: 0,
      votedUsers: {}
    },
  ]
}]};



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
