## Technologies:
- Express. 
- Mongoose. 
- Dotenv.
- Jsonwebtoken. 
- Bcrypt.
- Nodemon.
 
---

## ENDPOINTS

### USERS
| Method | Operation | Endpoint | Access | Request body | Response |
| ---------- | ------------- | ------------ | ------------------ | ------------------- | ----------- |
| POST   | Create   | `/users/register` | Public | `{ "userName": "string", "email": "string", "password": "string" }` | `201 Created / 400 Bad Request / 409 Conflict` |
| POST   | Read (login) | `/users/login` | Public | `{ "userName": "string" } or { "email": "string", "password": "string" }` | `200 OK / 401 Unauthorized / 404 Not Found` |
| GET     | Read (single) | `/users/:userName` | Auth (admin or owner) | Not applicable | `200 OK / 403 Forbidden / 404 Not Found` |
| PUT      | Update | `/usersi/:id` | Auth (admin or owner) | `{ "newUserName": "string", "newEmail": "string", "newPassword": "string", "currentPassword": "string" }` | `200 OK / 400 Bad Request / 401 Unauthorized / 403 Forbidden / 404 Not Found` |
| DELETE | | Delete | `/users/:id` | `Auth (admin or owner)` | Not applicable | `200 OK / 403 Forbidden / 404 Not Found` |

### EVENTS
| Method | Operation | Endpoint | Access | Request body | Response |
| ---------- | ------------- | ------------ | ------------------ | ------------------- | ----------- |
| GET      | Read (list)   | `/events` | Public | Not applicable | `200 OK / 500 Internal Server Error` |
| GET      | Read (single) | `/events/` | Public | Not applicable | `200 OK / 404 Not Found / 500 Internal Server Error` |
| POST    | Create (single) | `/events` | Auth | `{ "title": "string", "description": "string", "date": "date", "location": "string", "image": "file (multipart/form-data)" }` | `201 Created / 400 Bad Request / 500 Internal Server Error` |
| PUT      | Update | `/usersi/:id` | Auth (admin or owner) | `{ "title": "string", "description": "string", "date": "date", "location": "string", "image": "file (multipart/form-data)" }` | `200 OK / 403 Forbidden / 404 Not Found / 500 Internal Server Error` |
| POST    | Create (attend) | `/event/:id/attend` | Auth| Not applicable | `200 OK / 400 Bad Request / 404 Not Found / 500 Internal Server Error` |
| DELETE | | Delete | `/event/:id` | `Auth (admin or owner)` | Not applicable | `200 OK / 403 Forbidden / 404 Not Found / 500 Internal Server Error` |

---

Server.js
Config dotenv
import express
import function connectDB from db.js
import userRoutes and eventRoutes, main routes:
      - 	`app.use("/api/v1/users", userRoutes);`
      -   `app.use("/api/v1/events", eventRoutes);`
Set up server `const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor levantado en:http://localhost:${PORT}`);`
});
src > config > db.js
import mongoose
`function connectDB = async () => {}`
src > config > jwt.js
import jsonwebtoken
`const generateSign = (id) => {}`
`const verifyJWT = (token) => {}`
src > middlewares > isAuth.js (import Jasonwebtoken)
import User model
`const isAuth = async (req, res, next) => {}` check if there is token, parsed bearer, chekcs by id if not 401 error code.
src > middlewares > isAdmin.js
`const isAdmin = (req, res, next) => {}` checks role if not admin 403 error code
src > api > models > User.js
userSchema need the following data:
`userName, email, password, avatarUrl, role, timestamps, collection`


`userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});`
Before saving a user, the pre("save") hook hashes the password using bcrypt, ensuring that plain text passwords are never stored.
`usesrSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};`
The comparePassword method checks a login password against the stored hashed password and returns true or false.
src > api > models > Event.js
eventSchema needs the following data:
`title, date, location, description, imageURL, attendees, createdBy, timestamps`
