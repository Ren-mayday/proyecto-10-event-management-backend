const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    avatarURL: { type: String, required: false, trim: true, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    birthday: { type: Date, required: false },
    bio: { type: String, required: false, trim: true, maxlength: 300 },
    hiddenTalents: { type: String, required: false, trim: true },
    hobbies: { type: [String], required: false, default: [] },
    interests: { type: [String], required: false, default: [] },
    favoriteFood: { type: String, required: false, trim: true },
    socialMedia: {
      instagram: { type: String, required: false, trim: true },
      twitter: { type: String, required: false, trim: true },
      tiktok: { type: String, required: false, trim: true },
    },
    // Nuevos campos para la recuperación de contraseña
    securityQuestion: { type: String, required: true, trim: true },
    securityAnswer: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") && !this.isModified("securityAnswer")) return;

  // Hashear contraseña si se modifica
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Hashear respuesta de seguridad si ha sido modificada
  if (this.isModified("securityAnswer")) {
    this.securityAnswer = await bcrypt.hash(this.securityAnswer, 10);
  }
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// Añado nuevo método para comparar securityAnswer
userSchema.methods.compareSecurityAnswer = function (answer) {
  return bcrypt.compareSync(answer, this.securityAnswer);
};

const User = mongoose.model("User", userSchema, "users");
module.exports = User;
