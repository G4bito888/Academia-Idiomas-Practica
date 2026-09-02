const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares para poder leer JSON
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Endpoint POST para crear alumnos (Servicio REST)
app.post('/api/alumnos', (req, res) => {
    const nuevoAlumno = req.body;
    
    // Validación básica de los datos del alumno
    if(!nuevoAlumno.nombre_completo || !nuevoAlumno.idioma_nativo || !nuevoAlumno.tarjeta_credito) {
        return res.status(400).json({ error: "Faltan datos obligatorios para la inscripción" });
    }

    console.log("Datos recibidos:", nuevoAlumno);
    
    // Simulamos un código 201 Created
    res.status(201).json({
        mensaje: "Alumno recibido y validado correctamente por el servidor",
        datos: nuevoAlumno
    });
});

app.listen(PORT, () => {
    console.log(`Servidor REST de la Academia corriendo en http://localhost:${PORT}`);
});