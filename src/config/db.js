const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("Usando conexión existente ✅");
      return;
    }

    await mongoose.connect(process.env.DB_URL);

    console.log("Conectado con éxito a la BBDD ✅");
  } catch (error) {
    console.log("Error en la conexión de la BBDD ⛔", error.message);
    throw error;
  }
};

module.exports = { connectDB };
