# Event Management APP - Backend

API REST for event management with JWT authentification, allow registered users to create events and confirm assistance.

## Technologies:

- **Express** - Framework web for Node.js
- **Mongoose** - ODM (Object Document Mapper)
- **Dotenv** - Enviroment variables
- **Jsonwebtoken (JWT)** - Authentification based on tokens
- **Bcrypt** - Encrypting passwords
- **Nodemon** - Develompent with auto-loading
- **Multer** - Upload files
- **Cloudinary** - Image storage
- **CORS** - Configuration access cross-origin

---

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Create file .env with the following variables:
PORT=4000
DB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_key
API_SECRET=your_cloudinary_secret

# Execute in development
npm run dev

# Execute in production
npm start
```

---

## ENDPOINTS

### USERS

| Method | Operation | Endpoint | Access | Request Body | Response |
|--------|-----------|----------|--------|--------------|----------|
| POST | Register | `/api/v1/users/register` | Public | `{ "userName": "string", "email": "string", "password": "string", "securityQuestion": "string", "securityAnswer": "string" }` | `201 Created` / `400 Bad Request` / `409 Conflict` |
| POST | Login | `/api/v1/users/login` | Public | `{ "userName": "string", "password": "string" }` or `{ "email": "string", "password": "string" }` | `200 OK` / `401 Unauthorized` / `404 Not Found` |
| POST | Request Password Reset | `/api/v1/users/forgot-password` | Public | `{ "userName": "string" }` or `{ "email": "string" }` | `200 OK` / `404 Not Found` |
| POST | Reset Password | `/api/v1/users/reset-password` | Public | `{ "userId": "string", "securityAnswer": "string", "newPassword": "string" }` | `200 OK` / `400 Bad Request` / `401 Unauthorized` |
| GET | Get Profile | `/api/v1/users/:userName` | Auth | Not applicable | `200 OK` / `403 Forbidden` / `404 Not Found` |
| PUT | Update User | `/api/v1/users/:id` | Auth (admin or owner) | `{ "newUserName": "string", "newEmail": "string", "newPassword": "string", "currentPassword": "string", "avatar": "file", "birthday": "date", "bio": "string", "hiddenTalents": "string", "hobbies": ["string"], "interests": ["string"], "favoriteFood": "string", "socialMedia": { "instagram": "string", "twitter": "string", "tiktok": "string" } }` | `200 OK` / `400 Bad Request` / `401 Unauthorized` / `403 Forbidden` |
| DELETE | Delete User | `/api/v1/users/:id` | Auth (admin or owner) | Not applicable | `200 OK` / `403 Forbidden` / `404 Not Found` |

### EVENTS

| Method | Operation | Endpoint | Access | Request Body | Response |
|--------|-----------|----------|--------|--------------|----------|
| GET | Get All Events | `/api/v1/events` | Public | Not applicable | `200 OK` / `500 Internal Server Error` |
| GET | Get Event by ID | `/api/v1/events/:id` | Public | Not applicable | `200 OK` / `404 Not Found` / `500 Internal Server Error` |
| POST | Create Event | `/api/v1/events` | Auth | `{ "title": "string", "description": "string", "date": "YYYY-MM-DD", "time": "HH:MM", "location": "string", "image": "file (multipart/form-data)" }` | `201 Created` / `400 Bad Request` / `500 Internal Server Error` |
| PUT | Update Event | `/api/v1/events/:id` | Auth (admin or creator) | `{ "title": "string", "description": "string", "date": "date", "location": "string", "image": "file (multipart/form-data)" }` | `200 OK` / `403 Forbidden` / `404 Not Found` / `500 Internal Server Error` |
| POST | Attend Event | `/api/v1/events/:id/attend` | Auth | Not applicable | `200 OK` / `404 Not Found` / `500 Internal Server Error` |
| DELETE | Unattend Event | `/api/v1/events/:id/attend` | Auth | Not applicable | `200 OK` / `404 Not Found` / `500 Internal Server Error` |
| DELETE | Delete Event | `/api/v1/events/:id` | Auth (admin or creator) | Not applicable | `200 OK` / `403 Forbidden` / `404 Not Found` / `500 Internal Server Error` |

---

## Project Structure
```
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── userControllers.js
│   │   │   └── eventControllers.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Event.js
│   │   └── routes/
│   │       ├── userRoutes.js
│   │       └── eventRoutes.js
│   ├── config/
│   │   ├── db.js
│   │   ├── jwt.js
│   │   └── cloudinary.js
│   └── middlewares/
│       ├── isAuth.js
│       ├── isAdmin.js
│       └── file.js
├── server.js
├── .env
└── package.json
```

---

## Architecture Details

### `server.js`
Server entry point. Configures:
- Express app
- CORS to allow requests from frontend (localhost:5173)
- MongoDB connection via `connectDB()`
- Cloudinary connection via `connectCloudinary()`
- Main routes:
  - `/api/v1/users` → userRoutes
  - `/api/v1/events` → eventRoutes
- Server listening on port 4000 (configurable via `.env`)
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});
```

### `src/config/db.js`
MongoDB connection using Mongoose.
```javascript
const connectDB = async () => {
  await mongoose.connect(process.env.DB_URL);
};
```

### `src/config/jwt.js`
JSON Web Token management for authentication.
```javascript
const generateSign = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const verifyJWT = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
```

### `src/config/cloudinary.js`
Cloudinary configuration for image storage (avatars and event posters).
```javascript
const connectCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });
};
```

### `src/middlewares/isAuth.js`
Authentication middleware. Verifies:
1. Token presence in headers (Authorization: Bearer token)
2. JWT token validity
3. User existence in database
4. Adds `req.user` with authenticated user data

Returns 401/403 error if any validation fails.

### `src/middlewares/isAdmin.js`
Middleware that verifies if authenticated user has admin role. Returns 403 if not admin.
```javascript
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json("You don't have admin permissions");
  }
  next();
};
```

### `src/middlewares/file.js`
Multer configuration with Cloudinary Storage for file uploads (images).
- Allowed formats: jpg, jpeg, png, gif, webp
- Destination folder: `event-managment-app/users`

---

## Models

### `User.js`
User schema with the following fields:

**Required fields:**
- `userName` (String, unique)
- `email` (String, unique, lowercase)
- `password` (String, hashed with bcrypt)
- `securityQuestion` (String) - For password recovery
- `securityAnswer` (String, hashed with bcrypt) - For password recovery

**Optional fields:**
- `avatarURL` (String) - Cloudinary URL
- `role` (String: "user" | "admin", default: "user")
- `birthday` (Date)
- `bio` (String, max 300 characters)
- `hiddenTalents` (String)
- `hobbies` (Array of Strings)
- `interests` (Array of Strings)
- `favoriteFood` (String)
- `socialMedia` (Object with instagram, twitter, tiktok)

**Hooks and methods:**
```javascript
// Pre-save hook: hashes password and securityAnswer before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified("securityAnswer")) {
    this.securityAnswer = await bcrypt.hash(this.securityAnswer, 10);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// Method to compare security answer
userSchema.methods.compareSecurityAnswer = function (answer) {
  return bcrypt.compareSync(answer, this.securityAnswer);
};
```

### `Event.js`
Event schema with the following fields:

**Required fields:**
- `title` (String)
- `date` (Date)
- `location` (String)
- `createdBy` (ObjectId, ref: "User")

**Optional fields:**
- `description` (String)
- `imageURL` (String) - Cloudinary URL
- `attendees` (Array of ObjectIds, ref: "User")

**Virtual fields:**
- `formattedDate` - Returns date in DD/MM/YYYY HH:MM format
```javascript
eventSchema.virtual("formattedDate").get(function () {
  const day = String(this.date.getDate()).padStart(2, "0");
  const month = String(this.date.getMonth() + 1).padStart(2, "0");
  const year = this.date.getFullYear();
  const hours = String(this.date.getHours()).padStart(2, "0");
  const minutes = String(this.date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
});
```

---

## Security Features

- **Password Hashing**: All passwords are hashed with bcrypt (10 rounds)
- **Security Answer Hashing**: Security answers are also hashed
- **JWT Authentication**: Secure tokens for user sessions
- **Role-based Access Control**: Differentiated permissions for users and admins
- **Owner Verification**: Users can only modify their own content (except admins)
- **Password Reset Flow**: Recovery system using security question

---

## Error Handling

All endpoints implement consistent error handling:
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Invalid or expired token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate data (email, username)
- `500 Internal Server Error` - Server errors

---

## Key Features

✅ Complete JWT authentication  
✅ Password recovery system without emails  
✅ Image upload to Cloudinary  
✅ Automatic population of relationships (createdBy, attendees)  
✅ Events sorted by date  
✅ Future date validation for events  
✅ Automatic timezone management (CET/CEST)  
✅ Event attendance control (attend/unattend)  
✅ Customizable user profiles  
✅ Role system (user/admin)  

---

## 👩🏽‍💻 Author

Rencel Dayrit - Front End Developer

---