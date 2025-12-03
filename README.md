# 🌟 STARLIGHT CINEMA - Plataforma Premium de Cine

Plataforma espectacular de gestión de cine con cartelera exclusiva, venta de boletos, dulcería premium y sistema administrativo completo.

## 🚀 Características

### 🔐 Autenticación Simulada
- Login con roles: **Administrador** y **Cliente**
- Funciona con cualquier correo y contraseña
- Datos guardados en `localStorage`

### 🎭 Cartelera
- 8 películas de 2025 (Deadpool & Wolverine, Dune 2, Inside Out 2, etc.)
- Vista de cartelera con imágenes y detalles
- Sistema de funciones con horarios y salas

### 🎟️ Sistema de Boletos
- Selección visual de asientos (mapa 10x16)
- Estados: disponible, reservado, vendido, VIP
- Funciones por fecha, hora y sala

### 🍿 Dulcería
- 200 productos mock organizados en 5 categorías
- Combos, snacks, bebidas, palomitas y dulces
- Sistema de inventario y stock

### 💰 Sistema de Compras
- Carrito de compra con IVA (16%)
- Navegación fluida entre dulcería y carrito
- Registro de ventas

### 👑 Panel de Administrador
- Dashboard con estadísticas
- CRUD de películas
- CRUD de productos
- Reportes en PDF y Excel

### 📊 Reportes
- Exportación a PDF con logo
- Exportación a Excel
- Incluye: SKU, nombre, categoría, precio y stock

## 🎨 Diseño

- **Tema**: Ultra Premium Cinematográfico
- **Colores**: Rojo vibrante (#FF1744), Púrpura (#B24BF3) y Dorado (#FFD633)
- **Efectos**: Gradientes dinámicos, sombras resplandecientes, animaciones fluidas
- **Estilo**: Espectacular, moderno y premium
- **Responsive**: Perfectamente adaptado a todos los dispositivos

## 📦 Tecnologías

- ⚛️ React 18
- ⚡ Vite
- 🎨 Tailwind CSS
- 📘 TypeScript
- 🧩 shadcn/ui
- 📄 jsPDF + autoTable
- 📊 xlsx (SheetJS)

## 🚦 Roles y Accesos

### Cliente (`customer`)
- Ver cartelera exclusiva
- Seleccionar asientos en tiempo real
- Comprar boletos y productos premium
- Carrito de compra interactivo
- Navegación fluida entre secciones

### Administrador (`admin`)
- Dashboard con estadísticas en tiempo real
- Gestión completa de películas
- Gestión completa de productos
- Generación de reportes en PDF y Excel

## 🔧 Instalación

```bash
# Clonar el repositorio
git clone <YOUR_GIT_URL>

# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev
```

## 🌐 Rutas Principales

- `/` - Cartelera espectacular (público)
- `/login` - Inicio de sesión
- `/showtimes/:id` - Funciones de película
- `/seatmap/:id` - Selección de asientos
- `/products` - Dulcería premium
- `/customer/cart` - Carrito (cliente)
- `/admin/dashboard` - Panel admin
- `/admin/movies` - Gestión de películas
- `/admin/products` - Gestión de productos
- `/admin/reports` - Reportes

## 💾 Datos Mock

Todos los datos se persisten en `localStorage`:
- ✅ Usuarios y sesiones
- ✅ 8 películas
- ✅ 200 productos en 5 categorías
- ✅ Funciones y horarios
- ✅ Mapas de asientos
- ✅ Ventas y transacciones

## 🔌 Conexión a Backend (Futuro)

El proyecto está preparado para conectarse a un backend real:

1. Edita `src/config.ts`:
```typescript
export const USE_REMOTE = true;
export const API_LARAVEL = "https://tu-api-laravel.com/api";
export const API_NODE = "https://tu-api-node.com/api";
```

2. Los componentes ya están estructurados para migrar de `localStorage` a APIs REST.

## 📝 Credenciales Demo

Usa **cualquier correo y contraseña**, elige tu rol:
- `admin@starlight.com` / `cualquier_password` → **Administrador**
- `cliente@starlight.com` / `cualquier_password` → **Cliente**





