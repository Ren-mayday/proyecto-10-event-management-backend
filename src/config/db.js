const mongoose = require("mongoose");

let cachedConn = null;

const connectDB = async () => {
  // Si ya existe una conexión en caché, usarla
  if (cachedConn) {
    console.log("Usando conexión en caché ✅");
    return cachedConn;
  }

  try {
    const conn = await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    });

    cachedConn = conn;
    console.log("Conectado con éxito a la BBDD ✅");
    return conn;
  } catch (error) {
    console.log("Error en la conexión de la BBDD ⛔", error.message);
    throw error;
  }
};

module.exports = { connectDB };
