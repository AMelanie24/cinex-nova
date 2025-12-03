-- ================================================
-- CINEX NOVA - Script PostgreSQL
-- ================================================

-- 1. TABLA: users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: categories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 3. TABLA: products
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: movies
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

-- 5. TABLA: rooms
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 0,
    type VARCHAR(20) NOT NULL DEFAULT 'standard' CHECK (type IN ('standard', 'vip', 'imax'))
);

-- 6. TABLA: showtimes
CREATE TABLE IF NOT EXISTS showtimes (
    id SERIAL PRIMARY KEY,
    movie_id INT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA: seats
CREATE TABLE IF NOT EXISTS seats (
    id SERIAL PRIMARY KEY,
    showtime_id INT NOT NULL REFERENCES showtimes(id) ON DELETE CASCADE,
    row_label VARCHAR(5) NOT NULL,
    seat_number INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'vip')),
    UNIQUE(showtime_id, row_label, seat_number)
);

-- 8. TABLA: orders
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'canceled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABLA: order_items
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('ticket', 'product')),
    item_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL
);

-- ================================================
-- DATOS INICIALES
-- ================================================

-- USUARIOS DE PRUEBA
INSERT INTO users (email, password_hash, role) VALUES
('admin@cinex.com', 'admin123', 'admin'),
('admin@starlight.com', 'admin123', 'admin'),
('cliente@cinex.com', 'cliente123', 'customer'),
('cliente@starlight.com', 'cliente123', 'customer')
ON CONFLICT (email) DO NOTHING;

-- CATEGORÍAS DE PRODUCTOS
INSERT INTO categories (name, description) VALUES
('Combos', 'Combos de palomitas y bebidas'),
('Snacks', 'Botanas y snacks'),
('Bebidas', 'Bebidas frías y calientes'),
('Palomitas', 'Palomitas de diferentes tamaños'),
('Dulces', 'Dulces y golosinas')
ON CONFLICT DO NOTHING;

-- SALAS DE CINE
INSERT INTO rooms (name, capacity, type) VALUES
('Sala 1', 160, 'standard'),
('Sala 2', 160, 'standard'),
('Sala VIP', 80, 'vip'),
('Sala IMAX', 200, 'imax')
ON CONFLICT DO NOTHING;

-- PELÍCULAS
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

-- PRODUCTOS DE DULCERÍA
INSERT INTO products (sku, name, description, price, stock, category_id, image_url) VALUES
-- Combos (category_id = 1)
('COMBO-001', 'Combo Clásico', 'Palomitas medianas + Refresco mediano', 8.99, 100, 1, '/dulceria/combo1.jpg'),
('COMBO-002', 'Combo Familiar', 'Palomitas grandes + 2 Refrescos grandes', 15.99, 80, 1, '/dulceria/combo2.jpg'),
('COMBO-003', 'Combo Premium', 'Palomitas grandes + Refresco grande + Nachos', 18.99, 60, 1, '/dulceria/combo3.jpg'),
('COMBO-004', 'Combo Individual', 'Palomitas pequeñas + Refresco pequeño', 6.99, 120, 1, '/dulceria/combo4.jpg'),
('COMBO-005', 'Combo Duo', 'Palomitas medianas + 2 Refrescos medianos', 12.99, 90, 1, '/dulceria/combo5.jpg'),
('COMBO-006', 'Combo Super', 'Palomitas jumbo + 3 Refrescos grandes + Nachos', 24.99, 50, 1, '/dulceria/combo6.jpg'),
-- Snacks (category_id = 2)
('SNACK-001', 'Nachos con Queso', 'Nachos crujientes con queso cheddar', 5.99, 80, 2, '/dulceria/nachos.jpg'),
('SNACK-002', 'Hot Dog', 'Hot dog con salchicha premium', 4.99, 70, 2, '/dulceria/hot-dog.jpg'),
('SNACK-003', 'Pizza Personal', 'Pizza individual de pepperoni', 7.99, 40, 2, '/dulceria/pizza.jpg'),
('SNACK-004', 'Alitas Picantes', '6 alitas de pollo picantes', 8.99, 50, 2, '/dulceria/alitas.jpg'),
('SNACK-005', 'Dedos de Queso', '5 dedos de queso mozzarella', 6.99, 60, 2, '/dulceria/dedos-queso.jpg'),
('SNACK-006', 'Papas Fritas', 'Papas fritas crujientes', 3.99, 100, 2, '/dulceria/papas.jpg'),
('SNACK-007', 'Nuggets', '8 nuggets de pollo', 7.49, 70, 2, '/dulceria/nuggets.jpg'),
('SNACK-008', 'Pretzel', 'Pretzel caliente con queso', 5.49, 60, 2, '/dulceria/pretzel.jpg'),
-- Palomitas (category_id = 4)
('POP-001', 'Palomitas Pequeñas', 'Palomitas naturales 250g', 3.99, 150, 4, '/dulceria/solo.png'),
('POP-002', 'Palomitas Medianas', 'Palomitas naturales 500g', 5.99, 120, 4, '/dulceria/individual.jpg'),
('POP-003', 'Palomitas Grandes', 'Palomitas naturales 750g', 7.99, 100, 4, '/dulceria/grande.png'),
('POP-004', 'Palomitas Jumbo', 'Palomitas naturales 1kg', 9.99, 80, 4, '/dulceria/familiar.png'),
-- Bebidas (category_id = 3)
('BEB-001', 'Refresco Pequeño', 'Refresco de cola 350ml', 2.99, 200, 3, '/dulceria/combi.jpg'),
('BEB-002', 'Refresco Mediano', 'Refresco de cola 500ml', 3.99, 180, 3, '/dulceria/combi.jpg'),
('BEB-003', 'Refresco Grande', 'Refresco de cola 750ml', 4.99, 150, 3, '/dulceria/combi.jpg'),
('BEB-004', 'Agua Embotellada', 'Agua purificada 500ml', 2.49, 200, 3, '/dulceria/combi.jpg'),
('BEB-005', 'Jugo Natural', 'Jugo de naranja 400ml', 4.49, 100, 3, '/dulceria/combi.jpg'),
('BEB-006', 'Café Americano', 'Café americano caliente', 3.49, 120, 3, '/dulceria/combi.jpg'),
('BEB-007', 'Café Latte', 'Café latte con leche', 4.99, 100, 3, '/dulceria/combi.jpg')
ON CONFLICT (sku) DO NOTHING;
