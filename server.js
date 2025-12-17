require("dotenv").config();
const express = require("express");
const cors = require("cors"); // ← Importar CORS
const { connectDB } = require("./src/config/db");
const { connectCloudinary } = require("./src/config/cloudinary");
const userRoutes = require("./src/api/routes/userRoutes");
const eventRoutes = require("./src/api/routes/eventRoutes");

const app = express();

connectDB();
connectCloudinary();

app.use(
  cors({
    origin: "http://localhost:5173", // URL de frontend en Vite
    credentials: true, // Para enviar tokens/cookies
  })
);

app.use(express.json());

// Rutas principales
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/events", eventRoutes);

console.log("✅ Rutas registradas correctamente");

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor levantado en: http://localhost:${PORT}`);
});
