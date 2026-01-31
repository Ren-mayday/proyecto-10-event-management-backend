const Event = require("../models/Event");

//GET /events -> público. Ordenados por fecha
const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "userName email role")
      .populate("attendees", "userName email")
      .sort({ date: 1 });

    return res.status(200).json(events);
  } catch (error) {
    return res.status(500).json("Error al obtener eventos");
  }
};

// GET /events/:id -> público. Detalle + asistentes
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate("createdBy", "userName email role") // ← Populate creador
      .populate("attendees", "userName email"); // ← Populate asistentes

    if (!event) {
      return res.status(404).json("Evento no encontrado");
    }

    return res.status(200).json(event);
  } catch (error) {
    return res.status(500).json("Error al obtener el evento");
  }
};

// POST /events -> privado - cualquier user
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location } = req.body;

    // Validar campos obligatorios
    if (!title || !date || !time || !location) {
      return res.status(400).json({ error: "Faltan campos obligatorios (título, fecha, hora y ubicación)" });
    }

    // Uso UTC directamente, sin offset
    const dateTimeString = `${date}T${time}:00Z`;
    const parsedDate = new Date(dateTimeString);

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Formato de fecha u hora inválido" });
    }

    // Validar que la fecha sea futura
    if (parsedDate < new Date()) {
      return res.status(400).json({ error: "La fecha y hora deben ser futuras" });
    }

    const newEvent = new Event({
      title,
      description,
      date: parsedDate,
      location,
      imageURL: req.file?.path || "",
      createdBy: req.user._id,
    });

    const savedEvent = await newEvent.save();
    return res.status(201).json(savedEvent);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al crear el evento" });
  }
};

// PUT /event/:id (privado - admin o creador)
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json("Evento no encontrado");
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = event.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json("No tienes permisos para editar este evento");
    }

    const { title, description, date, time, location } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (location) event.location = location;
    if (req.file) event.imageURL = req.file.path;

    // Parsear fecha y hora correctamente, usar UTC directamente
    if (date) {
      const timeToUse = time || event.date.toISOString().slice(11, 16);
      const dateTimeString = `${date}T${timeToUse}:00Z`;
      const parsedDate = new Date(dateTimeString);

      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: "Formato de fecha u hora inválido" });
      }

      event.date = parsedDate;
    }

    const updatedEvent = await event.save();
    return res.status(200).json(updatedEvent);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Error al actualizar el evento");
  }
};

//POST /events/:id/attend -> privado
// Usuario se apunta al evento
const attendEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // $addToSet añade solo si no existe (evita duplicados automáticamente)
    const event = await Event.findByIdAndUpdate(id, { $addToSet: { attendees: userId } }, { new: true }).populate(
      "attendees",
      "userName email avatarURL",
    ); // Corregido: userName

    if (!event) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    return res.status(200).json({
      message: "Asistencia confirmada",
      event,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al apuntarse al evento" });
  }
};

//DELETE /events/:id/attend -> privado
// Usuario se desapunta del evento
const unattendEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const event = await Event.findByIdAndUpdate(
      id,
      { $pull: { attendees: userId } }, // $pull elimina del array
      { new: true },
    ).populate("attendees", "userName email avatarURL");

    if (!event) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    return res.status(200).json({
      message: "Te has desapuntado del evento",
      event,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al desapuntarse del evento" });
  }
};

// DELETE /events/:id (privado - admin o creador)
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json("Evento no encontrado");
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = event.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json("No tienes permisos para eliminar este evento");
    }

    await Event.findByIdAndDelete(id);

    return res.status(200).json("Evento eliminado correctamente");
  } catch (error) {
    return res.status(500).json("Error al eliminar el evento");
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  attendEvent,
  unattendEvent,
  deleteEvent,
};
