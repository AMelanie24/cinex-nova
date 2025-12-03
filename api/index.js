// api/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

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

// Conexión a PostgreSQL usando variables de entorno
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.get('/', (req, res) => {
  res.send('API de Cinex Nova funcionando ✅');
});

// ENDPOINT TEMPORAL: Inicializar base de datos
app.get('/api/init-db', async (req, res) => {
  try {
    const client = await pool.connect();

    // Crear tablas
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        duration INT NOT NULL,
        rating VARCHAR(10) NOT NULL,
        genre VARCHAR(100) NOT NULL,
        image VARCHAR(500),
        image_url VARCHAR(500),
        description TEXT,
        format VARCHAR(10) NOT NULL DEFAULT '2D' CHECK (format IN ('2D', '3D', 'IMAX')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insertar usuarios
    await client.query(`
      INSERT INTO users (email, password_hash, role) VALUES
      ('admin@cinex.com', 'admin123', 'admin'),
      ('admin@starlight.com', 'admin123', 'admin'),
      ('cliente@cinex.com', 'cliente123', 'customer'),
      ('cliente@starlight.com', 'cliente123', 'customer')
      ON CONFLICT (email) DO NOTHING;
    `);

    // Insertar categorías
    await client.query(`
      INSERT INTO categories (name, description) VALUES
      ('Combos', 'Combos de palomitas y bebidas'),
      ('Snacks', 'Botanas y snacks'),
      ('Bebidas', 'Bebidas frías y calientes'),
      ('Palomitas', 'Palomitas de diferentes tamaños'),
      ('Dulces', 'Dulces y golosinas')
      ON CONFLICT DO NOTHING;
    `);

    // Insertar películas
    await client.query(`
      INSERT INTO movies (title, duration, rating, genre, image, image_url, description, format) VALUES
      ('Deadpool & Wolverine', 128, 'R', 'Acción', '/posters/deadpool-wolverine.jpeg', '/posters/deadpool-wolverine.jpeg', 'El mercenario bocón y el mutante con garras se unen en una aventura épica.', '2D'),
      ('Dune: Part Two', 166, 'PG-13', 'Ciencia Ficción', '/posters/dune2.jpeg', '/posters/dune2.jpeg', 'Paul Atreides se une a los Fremen en su guerra contra la Casa Harkonnen.', '3D'),
      ('Inside Out 2', 96, 'PG', 'Animación', '/posters/inside-out-2.jpeg', '/posters/inside-out-2.jpeg', 'Riley entra en la adolescencia y nuevas emociones llegan a la central.', '2D'),
      ('Kung Fu Panda 4', 94, 'PG', 'Animación', '/posters/kungfu-panda4.jpg', '/posters/kungfu-panda4.jpg', 'Po debe entrenar a un nuevo Guerrero Dragón mientras enfrenta una nueva amenaza.', '2D'),
      ('Godzilla Minus One', 124, 'PG-13', 'Acción', '/posters/godzilla-minus-one.jpg', '/posters/godzilla-minus-one.jpg', 'Japón post-guerra enfrenta una nueva amenaza: Godzilla.', '2D'),
      ('Moana 2', 100, 'PG', 'Animación', '/posters/moana2.jpg', '/posters/moana2.jpg', 'Moana y Maui emprenden un nuevo viaje épico por los océanos.', '2D'),
      ('Mufasa: The Lion King', 118, 'PG', 'Animación', '/posters/mufasa.jpeg', '/posters/mufasa.jpeg', 'La historia del origen de Mufasa y su camino para convertirse en rey.', '2D'),
      ('Sonic the Hedgehog 3', 109, 'PG', 'Acción', '/posters/sonic3.jpg', '/posters/sonic3.jpg', 'Sonic, Tails y Knuckles enfrentan un nuevo y poderoso adversario: Shadow.', '2D')
      ON CONFLICT DO NOTHING;
    `);

    client.release();

    res.json({
      success: true,
      message: 'Base de datos inicializada correctamente con usuarios, categorías y películas'
    });
  } catch (err) {
    console.error('Error al inicializar base de datos:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// GET /api/movies - Obtener todas las películas
app.get('/api/movies', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, duration, rating, genre,
             COALESCE(image, image_url, '') AS image,
             description, format
      FROM movies
      ORDER BY id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/movies:', err);
    res.status(500).json({ error: 'Error al obtener películas' });
  }
});

// GET /api/showtimes - Obtener funciones (temporalmente vacío)
app.get('/api/showtimes', async (req, res) => {
  try {
    // Por ahora devuelve array vacío
    // TODO: Implementar tabla showtimes y rooms
    res.json([]);
  } catch (err) {
    console.error('Error en /api/showtimes:', err);
    res.status(500).json({ error: 'Error al obtener funciones' });
  }
});

// LOGIN - busca usuario por email y valida contraseña
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    // Buscar usuario solo por email (PostgreSQL usa $1, $2 en lugar de ?)
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const user = result.rows[0];

    // Validar contraseña (en producción debería usar bcrypt)
    if (user.password_hash !== password) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    // Mapear roles de la base de datos a los del frontend
    // Base de datos puede tener: 'administrador' o 'cliente'
    // Frontend espera: 'admin' or 'customer'
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
