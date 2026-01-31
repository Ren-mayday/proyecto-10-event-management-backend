const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Si ya está conectado, no hacer nada
    if (mongoose.connection.readyState === 1) {
      console.log("Usando conexión existente ✅");
      return;
    }

    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log("Conectado con éxito a la BBDD ✅");
  } catch (error) {
    console.log("Error en la conexión de la BBDD ⛔", error.message);
    // Cerrar conexión fallida para que lo reintente
    await mongoose.disconnect();
    throw error;
  }
};

module.exports = { connectDB };
