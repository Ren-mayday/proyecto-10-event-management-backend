const User = require("../models/User");
const bcrypt = require("bcrypt");
const { generateSign } = require("../../config/jwt.js");

//POST /register registrar user normal
const registerUser = async (req, res) => {
  console.log("🟡 Controlador registerUser ejecutado");
  console.log("📦 req.body:", req.body);

  try {
    const { userName, email, password } = req.body;
    console.log("1️⃣ Datos extraídos");

    // 1. Validar datos obligatorios
    if (!userName || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // 2. Validar formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Este email no es válido" });
    }

    // 3. Comprobar si user name está duplicado
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res.status(409).json("Este usuario ya existe");
    }

    // 4. Comprobar si email está duplicado
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json("Este email ya existe");
    }

    // 5. Crear nuevo usuario
    const newUser = new User({ userName, email, password });
    const userSaved = await newUser.save();
    userSaved.password = undefined;

    return res.status(201).json({ message: "Usuario registrado correctamente", user: userSaved });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    const user = await User.findOne({ $or: [{ userName }, { email }] });
    const errorMessage = "Usuario o contraseña incorrectos";

    if (!user) {
      return res.status(404).json({ message: errorMessage });
    }

    //3. Comparar contraseña con bcrypt
    const isPasswordValid = user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: errorMessage });
    }

    // Si todo está bien -> generar token JWT
    const token = generateSign(user._id);

    //4. Si user y password ok
    return res.status(200).json({
      message: "Te has logueado correctamente",
      token,
      user: { id: user._id, userName: user.userName, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor al intentar loguear", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      newUserName,
      newEmail,
      newPassword,
      newRole,
      currentPassword,
      // Añado NUEVOS CAMPOS
      birthday,
      bio,
      hiddenTalents,
      hobbies,
      interests,
      favoriteFood,
      socialMedia,
    } = req.body;

    // 1. Buscar usuario objetivo
    const user = await User.findById(id).select("+password");

    if (!user) {
      return res.status(404).json("Usuario no encontrado");
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = req.user._id.equals(user._id);

    // 2. Permisos
    if (!isAdmin && !isOwner) {
      return res.status(403).json("No puedes modificar este usuario");
    }

    // 3. Si NO es admin, debe validar su contraseña para actualizar datos
    if (!isAdmin) {
      if (!currentPassword) {
        return res.status(400).json("Debes enviar tu contraseña actual para actualizar tus datos");
      }

      const isValidPass = user.comparePassword(currentPassword);
      if (!isValidPass) {
        return res.status(401).json("La contraseña actual es incorrecta");
      }
    }

    // 4. Campos editables

    // -- Role (sólo admin) --
    if (newRole) {
      if (!isAdmin) {
        return res.status(403).json("Sólo un admin puede cambiar roles");
      }
      if (!["admin", "user"].includes(newRole)) {
        return res.status(400).json("Role inválido, Debe ser 'admin' o 'user'");
      }
      if (user.role !== newRole) {
        user.role = newRole;
      }
    }

    // -- Nombre usuario --
    if (newUserName && newUserName !== user.userName) {
      const exists = await User.findOne({ userName: newUserName });
      if (exists) return res.status(409).json("Este nombre de usuario ya existe");
      user.userName = newUserName;
    }

    // -- Email --
    if (newEmail && newEmail !== user.email) {
      const exists = await User.findOne({ email: newEmail });
      if (exists) return res.status(409).json("Este email ya está registrado");
      user.email = newEmail;
    }

    // -- Contraseña --
    if (newPassword) {
      const same = await bcrypt.compare(newPassword, user.password);
      if (same) {
        return res.status(400).json("La nueva contraseña no puede ser igual a la actual");
      }
      user.password = newPassword;
    }

    // -- Avatar --
    if (req.file) {
      user.avatarURL = req.file.path;
    }

    // Añado CAMPOS DE PERFIL
    if (birthday !== undefined) user.birthday = birthday;
    if (bio !== undefined) user.bio = bio;
    if (hiddenTalents !== undefined) user.hiddenTalents = hiddenTalents;
    if (hobbies !== undefined) user.hobbies = hobbies;
    if (interests !== undefined) user.interests = interests;
    if (favoriteFood !== undefined) user.favoriteFood = favoriteFood;
    if (socialMedia !== undefined) user.socialMedia = socialMedia;

    // 5. Guardar cambios
    const updated = await user.save();

    // 6. Limpiar password antes de enviar
    const userObj = updated.toObject();
    delete userObj.password;

    return res.status(200).json({
      message: "Usuario actualizado correctamente",
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en updateUser",
      error: error.message,
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { userName } = req.params;

    // Cualquier usuario autenticado puede ver perfiles
    if (!req.user) {
      return res.status(403).json("Debes estar logueado para ver perfiles");
    }

    const user = await User.findOne({ userName }).select("-password");

    if (!user) {
      return res.status(404).json("Usuario no encontrado");
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener usuario", error: error.message });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const isAdmin = req.user.role === "admin";
    const isOwner = req.user._id.toString() === id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json("No tienes permisos para eliminar este usuario");
    }

    // 1. Buscar usuario
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 2. Eliminarlo después
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Usuario y sus sesiones asociadas han sido eliminados",
      userDeleted: user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar el usuario", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  getUserProfile,
  deleteUser,
};
