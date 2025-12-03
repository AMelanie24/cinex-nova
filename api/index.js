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

    await client.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        capacity INT NOT NULL DEFAULT 100,
        type VARCHAR(20) NOT NULL DEFAULT 'standard' CHECK (type IN ('standard', 'vip', 'imax'))
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS showtimes (
        id SERIAL PRIMARY KEY,
        movie_id INT NOT NULL REFERENCES movies(id),
        room_id INT NOT NULL REFERENCES rooms(id),
        show_date DATE NOT NULL,
        show_time TIME NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 85.00
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS seats (
        id SERIAL PRIMARY KEY,
        showtime_id INT NOT NULL REFERENCES showtimes(id),
        row_label VARCHAR(2) NOT NULL,
        seat_number INT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
        UNIQUE(showtime_id, row_label, seat_number)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        category_id INT REFERENCES categories(id),
        image_url VARCHAR(500)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT NOT NULL REFERENCES orders(id),
        item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('ticket', 'product')),
        showtime_id INT REFERENCES showtimes(id),
        seat_row VARCHAR(2),
        seat_number INT,
        product_id INT REFERENCES products(id),
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL
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

    // Insertar salas
    await client.query(`
      INSERT INTO rooms (name, capacity, type) VALUES
      ('Sala 1', 120, 'standard'),
      ('Sala 2', 100, 'standard'),
      ('Sala 3', 80, 'standard'),
      ('Sala VIP', 50, 'vip'),
      ('Sala IMAX', 200, 'imax')
      ON CONFLICT DO NOTHING;
    `);

    // Insertar productos de dulcería
    await client.query(`
      INSERT INTO products (sku, name, description, price, stock, category_id, image_url) VALUES
      ('COMBO-1', 'Combo Individual', 'Palomitas medianas + Refresco mediano', 125.00, 100, 1, '/dulceria/combo1.jpg'),
      ('COMBO-2', 'Combo Pareja', 'Palomitas grandes + 2 Refrescos medianos', 185.00, 100, 1, '/dulceria/combo2.jpg'),
      ('COMBO-3', 'Combo Familiar', 'Palomitas jumbo + 4 Refrescos + Nachos', 299.00, 100, 1, '/dulceria/combo3.jpg'),
      ('PAL-CH', 'Palomitas Chicas', 'Palomitas de maíz tamaño chico', 45.00, 200, 4, '/dulceria/palomitas-ch.jpg'),
      ('PAL-MED', 'Palomitas Medianas', 'Palomitas de maíz tamaño mediano', 65.00, 200, 4, '/dulceria/palomitas-med.jpg'),
      ('PAL-GDE', 'Palomitas Grandes', 'Palomitas de maíz tamaño grande', 85.00, 200, 4, '/dulceria/palomitas-gde.jpg'),
      ('REF-CH', 'Refresco Chico', 'Refresco de 355ml', 35.00, 300, 3, '/dulceria/refresco-ch.jpg'),
      ('REF-MED', 'Refresco Mediano', 'Refresco de 500ml', 45.00, 300, 3, '/dulceria/refresco-med.jpg'),
      ('REF-GDE', 'Refresco Grande', 'Refresco de 750ml', 55.00, 300, 3, '/dulceria/refresco-gde.jpg'),
      ('NACHOS', 'Nachos con Queso', 'Nachos con queso derretido', 75.00, 150, 2, '/dulceria/nachos.jpg'),
      ('HOTDOG', 'Hot Dog', 'Hot dog con salchicha jumbo', 65.00, 100, 2, '/dulceria/hotdog.jpg'),
      ('CHOCO', 'Chocolates', 'Barra de chocolate', 35.00, 200, 5, '/dulceria/chocolate.jpg')
      ON CONFLICT (sku) DO NOTHING;
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

    // Insertar funciones (showtimes) - próximos 7 días para cada película
    const today = new Date();
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);
      const dateStr = date.toISOString().split('T')[0];

      // Funciones para cada película (movie_id 1-8) en diferentes salas y horarios
      const showtimesData = [
        // Deadpool & Wolverine (movie 1)
        { movie: 1, room: 1, time: '14:00', price: 85 },
        { movie: 1, room: 2, time: '17:30', price: 85 },
        { movie: 1, room: 4, time: '20:00', price: 150 }, // VIP
        // Dune (movie 2)
        { movie: 2, room: 5, time: '15:00', price: 180 }, // IMAX
        { movie: 2, room: 3, time: '19:00', price: 95 },
        // Inside Out 2 (movie 3)
        { movie: 3, room: 1, time: '11:00', price: 75 },
        { movie: 3, room: 2, time: '13:30', price: 75 },
        { movie: 3, room: 3, time: '16:00', price: 85 },
        // Kung Fu Panda 4 (movie 4)
        { movie: 4, room: 1, time: '10:30', price: 75 },
        { movie: 4, room: 2, time: '15:00', price: 85 },
        // Godzilla (movie 5)
        { movie: 5, room: 5, time: '18:00', price: 180 }, // IMAX
        { movie: 5, room: 1, time: '21:00', price: 95 },
        // Moana 2 (movie 6)
        { movie: 6, room: 2, time: '11:30', price: 75 },
        { movie: 6, room: 3, time: '14:00', price: 85 },
        // Mufasa (movie 7)
        { movie: 7, room: 1, time: '12:00', price: 75 },
        { movie: 7, room: 4, time: '17:00', price: 150 }, // VIP
        // Sonic 3 (movie 8)
        { movie: 8, room: 2, time: '16:30', price: 85 },
        { movie: 8, room: 3, time: '19:30', price: 95 },
      ];

      for (const st of showtimesData) {
        await client.query(`
          INSERT INTO showtimes (movie_id, room_id, show_date, show_time, price)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [st.movie, st.room, dateStr, st.time, st.price]);
      }
    }

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

// GET /api/showtimes - Obtener funciones
app.get('/api/showtimes', async (req, res) => {
  try {
    const { movie_id, id } = req.query;

    let query = `
      SELECT s.id, s.movie_id, s.room_id,
             TO_CHAR(s.show_date, 'YYYY-MM-DD') as show_date,
             TO_CHAR(s.show_time, 'HH24:MI') as show_time,
             s.price,
             r.name as room_name, r.type as room_type
      FROM showtimes s
      JOIN rooms r ON s.room_id = r.id
    `;
    const params = [];

    if (id) {
      query += ' WHERE s.id = $1';
      params.push(id);
    } else if (movie_id) {
      query += ' WHERE s.movie_id = $1 AND s.show_date >= CURRENT_DATE';
      params.push(movie_id);
    } else {
      query += ' WHERE s.show_date >= CURRENT_DATE';
    }

    query += ' ORDER BY s.show_date, s.show_time';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/showtimes:', err);
    res.status(500).json({ error: 'Error al obtener funciones' });
  }
});

// GET /api/rooms - Obtener salas
app.get('/api/rooms', async (req, res) => {
  try {
    const { id } = req.query;

    let query = 'SELECT id, name, capacity, type FROM rooms';
    const params = [];

    if (id) {
      query += ' WHERE id = $1';
      params.push(id);
    }

    query += ' ORDER BY id';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/rooms:', err);
    res.status(500).json({ error: 'Error al obtener salas' });
  }
});

// GET /api/seats - Obtener asientos de una función
app.get('/api/seats', async (req, res) => {
  try {
    const { showtime_id } = req.query;
    if (!showtime_id) {
      return res.status(400).json({ error: 'showtime_id es requerido' });
    }

    // Obtener asientos existentes
    const result = await pool.query(
      'SELECT row_label, seat_number, status FROM seats WHERE showtime_id = $1 ORDER BY row_label, seat_number',
      [showtime_id]
    );

    // Si no hay asientos, generar la grilla completa (10 filas x 12 asientos)
    if (result.rows.length === 0) {
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      const seats = [];
      for (const row of rows) {
        for (let num = 1; num <= 12; num++) {
          seats.push({ row_label: row, seat_number: num, status: 'available' });
        }
      }
      return res.json(seats);
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/seats:', err);
    res.status(500).json({ error: 'Error al obtener asientos' });
  }
});

// POST /api/seats - Reservar asientos
app.post('/api/seats', async (req, res) => {
  try {
    const { showtime_id, seats, status = 'reserved' } = req.body;

    if (!showtime_id || !seats || !Array.isArray(seats)) {
      return res.status(400).json({ error: 'showtime_id y seats son requeridos' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const seat of seats) {
        await client.query(`
          INSERT INTO seats (showtime_id, row_label, seat_number, status)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (showtime_id, row_label, seat_number)
          DO UPDATE SET status = $4
        `, [showtime_id, seat.row, seat.number, status]);
      }

      await client.query('COMMIT');
      res.json({ ok: true, message: 'Asientos actualizados' });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error en POST /api/seats:', err);
    res.status(500).json({ error: 'Error al reservar asientos' });
  }
});

// GET /api/products - Obtener productos
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, sku, name, description, price, stock, category_id, image_url
      FROM products
      ORDER BY category_id, name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/products:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// POST /api/products - Crear producto
app.post('/api/products', async (req, res) => {
  try {
    const { sku, name, description, price, stock, category_id, image_url } = req.body;
    const result = await pool.query(`
      INSERT INTO products (sku, name, description, price, stock, category_id, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [sku, name, description, price, stock, category_id, image_url]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error en POST /api/products:', err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT /api/products/:id - Actualizar producto
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, name, description, price, stock, category_id, image_url } = req.body;
    await pool.query(`
      UPDATE products SET sku=$1, name=$2, description=$3, price=$4, stock=$5, category_id=$6, image_url=$7
      WHERE id=$8
    `, [sku, name, description, price, stock, category_id, image_url, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error en PUT /api/products:', err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /api/products/:id - Eliminar producto
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error en DELETE /api/products:', err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// GET /api/categories - Obtener categorías
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, description FROM categories ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/categories:', err);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// POST /api/categories - Crear categoría
app.post('/api/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error en POST /api/categories:', err);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

// PUT /api/categories/:id - Actualizar categoría
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await pool.query('UPDATE categories SET name = $1 WHERE id = $2', [name, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error en PUT /api/categories:', err);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

// DELETE /api/categories/:id - Eliminar categoría
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error en DELETE /api/categories:', err);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

// POST /api/orders - Crear orden
app.post('/api/orders', async (req, res) => {
  try {
    const { customer_name, customer_email, items } = req.body;

    if (!customer_name || !customer_email || !items) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Crear orden
      const orderResult = await client.query(
        'INSERT INTO orders (customer_name, customer_email, total) VALUES ($1, $2, $3) RETURNING id',
        [customer_name, customer_email, total]
      );
      const orderId = orderResult.rows[0].id;

      // Insertar items
      for (const item of items) {
        if (item.type === 'ticket') {
          await client.query(`
            INSERT INTO order_items (order_id, item_type, showtime_id, seat_row, seat_number, quantity, unit_price, subtotal)
            VALUES ($1, 'ticket', $2, $3, $4, $5, $6, $7)
          `, [orderId, item.showtime_id, item.seat_row, item.seat_number, item.quantity, item.unit_price, item.subtotal]);

          // Marcar asiento como vendido
          await client.query(`
            INSERT INTO seats (showtime_id, row_label, seat_number, status)
            VALUES ($1, $2, $3, 'sold')
            ON CONFLICT (showtime_id, row_label, seat_number) DO UPDATE SET status = 'sold'
          `, [item.showtime_id, item.seat_row, item.seat_number]);
        } else {
          await client.query(`
            INSERT INTO order_items (order_id, item_type, product_id, quantity, unit_price, subtotal)
            VALUES ($1, 'product', $2, $3, $4, $5)
          `, [orderId, item.product_id, item.quantity, item.unit_price, item.subtotal]);
        }
      }

      await client.query('COMMIT');
      res.json({ ok: true, order_id: orderId });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error en POST /api/orders:', err);
    res.status(500).json({ error: 'Error al crear orden' });
  }
});

// GET /api/orders - Obtener órdenes por email
app.get('/api/orders', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email requerido' });
    }

    const result = await pool.query(`
      SELECT o.*, json_agg(oi.*) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_email = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [email]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error en /api/orders:', err);
    res.status(500).json({ error: 'Error al obtener órdenes' });
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
