const { isAuth } = require("../../middlewares/isAuth");
const {
  registerUser,
  loginUser,
  updateUser,
  getUserProfile,
  deleteUser,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/userControllers");
const upload = require("../../middlewares/file");

const userRoutes = require("express").Router();

// Registro
userRoutes.post("/register", registerUser);

// Login
userRoutes.post("/login", loginUser);

// Recuperación de contraseña
userRoutes.post("/forgot-password", requestPasswordReset);
userRoutes.post("/reset-password", resetPassword);

// Obtener perfil (admin o dueño → controlado en el controller)
userRoutes.get("/:userName", [isAuth], getUserProfile);

// Update user (admin o dueño → controlado en el controller)
userRoutes.put("/:id", [isAuth, upload.single("avatar")], updateUser);

// Delete user (admin o dueño → controlado en el controller)
userRoutes.delete("/:id", [isAuth], deleteUser);

module.exports = userRoutes;
