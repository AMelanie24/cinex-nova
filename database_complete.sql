-- ================================================
-- CINEX NOVA - Script Completo de Base de Datos
-- ================================================

-- Crear tablas en el orden correcto (respetando dependencias)

-- 1. TABLA: users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLA: categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLA: products
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    category_id INT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLA: movies
CREATE TABLE IF NOT EXISTS movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    duration INT NOT NULL COMMENT 'Duración en minutos',
    rating VARCHAR(10) NOT NULL COMMENT 'Clasificación (G, PG, PG-13, R, etc.)',
    genre VARCHAR(100) NOT NULL,
    image VARCHAR(500),
    image_url VARCHAR(500),
    description TEXT,
    format ENUM('2D', '3D', 'IMAX') NOT NULL DEFAULT '2D',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLA: rooms
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL DEFAULT 0,
    type ENUM('standard', 'vip', 'imax') NOT NULL DEFAULT 'standard'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABLA: showtimes
CREATE TABLE IF NOT EXISTS showtimes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    room_id INT NOT NULL,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABLA: seats
CREATE TABLE IF NOT EXISTS seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    showtime_id INT NOT NULL,
    row_label VARCHAR(5) NOT NULL COMMENT 'A, B, C, etc.',
    seat_number INT NOT NULL,
    status ENUM('available', 'reserved', 'sold', 'vip') NOT NULL DEFAULT 'available',
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_seat (showtime_id, row_label, seat_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TABLA: orders
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('pending', 'completed', 'canceled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TABLA: order_items
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_type ENUM('ticket', 'product') NOT NULL,
    item_id INT NOT NULL COMMENT 'ID de seat o product',
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- DATOS INICIALES
-- ================================================

-- USUARIOS DE PRUEBA
INSERT INTO users (email, password_hash, role) VALUES
('admin@cinex.com', 'admin123', 'admin'),
('admin@starlight.com', 'admin123', 'admin'),
('cliente@cinex.com', 'cliente123', 'customer'),
('cliente@starlight.com', 'cliente123', 'customer')
ON DUPLICATE KEY UPDATE email=email;

-- CATEGORÍAS DE PRODUCTOS
INSERT INTO categories (id, name, description) VALUES
(1, 'Combos', 'Combos de palomitas y bebidas'),
(2, 'Snacks', 'Botanas y snacks'),
(3, 'Bebidas', 'Bebidas frías y calientes'),
(4, 'Palomitas', 'Palomitas de diferentes tamaños'),
(5, 'Dulces', 'Dulces y golosinas')
ON DUPLICATE KEY UPDATE name=name;

-- SALAS DE CINE
INSERT INTO rooms (id, name, capacity, type) VALUES
(1, 'Sala 1', 160, 'standard'),
(2, 'Sala 2', 160, 'standard'),
(3, 'Sala VIP', 80, 'vip'),
(4, 'Sala IMAX', 200, 'imax')
ON DUPLICATE KEY UPDATE name=name;

-- PELÍCULAS
INSERT INTO movies (id, title, duration, rating, genre, image, image_url, description, format) VALUES
(1, 'Deadpool & Wolverine', 128, 'R', 'Acción', '/posters/deadpool-wolverine.jpeg', '/posters/deadpool-wolverine.jpeg', 'El mercenario bocón y el mutante con garras se unen en una aventura épica.', '2D'),
(2, 'Dune: Part Two', 166, 'PG-13', 'Ciencia Ficción', '/posters/dune2.jpeg', '/posters/dune2.jpeg', 'Paul Atreides se une a los Fremen en su guerra contra la Casa Harkonnen.', '3D'),
(3, 'Inside Out 2', 96, 'PG', 'Animación', '/posters/inside-out-2.jpeg', '/posters/inside-out-2.jpeg', 'Riley entra en la adolescencia y nuevas emociones llegan a la central.', '2D'),
(4, 'Kung Fu Panda 4', 94, 'PG', 'Animación', '/posters/kungfu-panda4.jpg', '/posters/kungfu-panda4.jpg', 'Po debe entrenar a un nuevo Guerrero Dragón mientras enfrenta una nueva amenaza.', '2D'),
(5, 'Godzilla Minus One', 124, 'PG-13', 'Acción', '/posters/godzilla-minus-one.jpg', '/posters/godzilla-minus-one.jpg', 'Japón post-guerra enfrenta una nueva amenaza: Godzilla.', '2D'),
(6, 'Moana 2', 100, 'PG', 'Animación', '/posters/moana2.jpg', '/posters/moana2.jpg', 'Moana y Maui emprenden un nuevo viaje épico por los océanos.', '2D'),
(7, 'Mufasa: The Lion King', 118, 'PG', 'Animación', '/posters/mufasa.jpeg', '/posters/mufasa.jpeg', 'La historia del origen de Mufasa y su camino para convertirse en rey.', '2D'),
(8, 'Sonic the Hedgehog 3', 109, 'PG', 'Acción', '/posters/sonic3.jpg', '/posters/sonic3.jpg', 'Sonic, Tails y Knuckles enfrentan un nuevo y poderoso adversario: Shadow.', '2D')
ON DUPLICATE KEY UPDATE title=title;

-- PRODUCTOS DE DULCERÍA
INSERT INTO products (id, sku, name, description, price, stock, category_id, image_url) VALUES
-- Combos
(1, 'COMBO-001', 'Combo Clásico', 'Palomitas medianas + Refresco mediano', 8.99, 100, 1, '/dulceria/combo1.jpg'),
(2, 'COMBO-002', 'Combo Familiar', 'Palomitas grandes + 2 Refrescos grandes', 15.99, 80, 1, '/dulceria/combo2.jpg'),
(3, 'COMBO-003', 'Combo Premium', 'Palomitas grandes + Refresco grande + Nachos', 18.99, 60, 1, '/dulceria/combo3.jpg'),
(4, 'COMBO-004', 'Combo Individual', 'Palomitas pequeñas + Refresco pequeño', 6.99, 120, 1, '/dulceria/combo4.jpg'),
(5, 'COMBO-005', 'Combo Duo', 'Palomitas medianas + 2 Refrescos medianos', 12.99, 90, 1, '/dulceria/combo5.jpg'),
(6, 'COMBO-006', 'Combo Super', 'Palomitas jumbo + 3 Refrescos grandes + Nachos', 24.99, 50, 1, '/dulceria/combo6.jpg'),

-- Snacks
(7, 'SNACK-001', 'Nachos con Queso', 'Nachos crujientes con queso cheddar', 5.99, 80, 2, '/dulceria/nachos.jpg'),
(8, 'SNACK-002', 'Hot Dog', 'Hot dog con salchicha premium', 4.99, 70, 2, '/dulceria/hot-dog.jpg'),
(9, 'SNACK-003', 'Pizza Personal', 'Pizza individual de pepperoni', 7.99, 40, 2, '/dulceria/pizza.jpg'),
(10, 'SNACK-004', 'Alitas Picantes', '6 alitas de pollo picantes', 8.99, 50, 2, '/dulceria/alitas.jpg'),
(11, 'SNACK-005', 'Dedos de Queso', '5 dedos de queso mozzarella', 6.99, 60, 2, '/dulceria/dedos-queso.jpg'),
(12, 'SNACK-006', 'Papas Fritas', 'Papas fritas crujientes', 3.99, 100, 2, '/dulceria/papas.jpg'),
(13, 'SNACK-007', 'Nuggets', '8 nuggets de pollo', 7.49, 70, 2, '/dulceria/nuggets.jpg'),
(14, 'SNACK-008', 'Pretzel', 'Pretzel caliente con queso', 5.49, 60, 2, '/dulceria/pretzel.jpg'),

-- Palomitas
(15, 'POP-001', 'Palomitas Pequeñas', 'Palomitas naturales 250g', 3.99, 150, 4, '/dulceria/solo.png'),
(16, 'POP-002', 'Palomitas Medianas', 'Palomitas naturales 500g', 5.99, 120, 4, '/dulceria/individual.jpg'),
(17, 'POP-003', 'Palomitas Grandes', 'Palomitas naturales 750g', 7.99, 100, 4, '/dulceria/grande.png'),
(18, 'POP-004', 'Palomitas Jumbo', 'Palomitas naturales 1kg', 9.99, 80, 4, '/dulceria/familiar.png'),

-- Bebidas (agregando más variedad)
(19, 'BEB-001', 'Refresco Pequeño', 'Refresco de cola 350ml', 2.99, 200, 3, '/dulceria/combi.jpg'),
(20, 'BEB-002', 'Refresco Mediano', 'Refresco de cola 500ml', 3.99, 180, 3, '/dulceria/combi.jpg'),
(21, 'BEB-003', 'Refresco Grande', 'Refresco de cola 750ml', 4.99, 150, 3, '/dulceria/combi.jpg'),
(22, 'BEB-004', 'Agua Embotellada', 'Agua purificada 500ml', 2.49, 200, 3, '/dulceria/combi.jpg'),
(23, 'BEB-005', 'Jugo Natural', 'Jugo de naranja 400ml', 4.49, 100, 3, '/dulceria/combi.jpg'),
(24, 'BEB-006', 'Café Americano', 'Café americano caliente', 3.49, 120, 3, '/dulceria/combi.jpg'),
(25, 'BEB-007', 'Café Latte', 'Café latte con leche', 4.99, 100, 3, '/dulceria/combi.jpg')
ON DUPLICATE KEY UPDATE sku=sku;

-- ================================================
-- FIN DEL SCRIPT
-- ================================================
