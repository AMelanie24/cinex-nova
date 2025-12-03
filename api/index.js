// api/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configurado para permitir peticiones desde el frontend
const corsOptions = {
  origin: '*', // Permite todos los orígenes (cambiar en producción si es necesario)
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Conexión a MySQL usando variables de entorno
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/', (req, res) => {
  res.send('API de Cinex Nova funcionando ✅');
});

// LOGIN - busca usuario por email y valida contraseña
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    // Buscar usuario solo por email
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const user = rows[0];

    // Validar contraseña (en producción debería usar bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    // Mapear roles de la base de datos a los del frontend
    // Base de datos puede tener: 'administrador' o 'cliente'
    // Frontend espera: 'admin' o 'customer'
    let roleForFrontend = 'customer';
    if (user.role === 'administrador' || user.role === 'admin') {
      roleForFrontend = 'admin';
    } else if (user.role === 'cliente' || user.role === 'customer') {
      roleForFrontend = 'customer';
    }

    res.json({
      ok: true,
      message: 'Inicio de sesión correcto',
      email: user.email,
      role: roleForFrontend,
      user: {
        id: user.id,
        email: user.email,
        role: roleForFrontend
      }
    });
  } catch (err) {
    console.error('Error en /api/login:', err);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
