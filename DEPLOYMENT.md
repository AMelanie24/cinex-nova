# 🚀 GUÍA DE DESPLIEGUE - CINEX NOVA

Esta guía te ayudará a desplegar el proyecto CINEX NOVA con:
- **Backend** en Render
- **Frontend** en InfinityFree
- **Base de Datos** MySQL en InfinityFree

---

## 📋 REQUISITOS PREVIOS

- [x] Cuenta en [Render](https://render.com) (gratis)
- [x] Cuenta en [InfinityFree](https://infinityfree.net) (gratis)
- [x] Base de datos MySQL ya configurada en InfinityFree
- [x] Node.js instalado localmente (para build)
- [x] Git instalado

---

## 🔧 PARTE 1: DESPLEGAR BACKEND EN RENDER

### Paso 1: Preparar el Repositorio

1. **Crear repositorio en GitHub** (si no lo tienes):
   ```bash
   cd cinex-nova-main
   git init
   git add .
   git commit -m "Initial commit - Cinex Nova"
   git remote add origin https://github.com/TU_USUARIO/cinex-nova.git
   git push -u origin main
   ```

### Paso 2: Desplegar en Render

1. Ve a [https://dashboard.render.com](https://dashboard.render.com)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Configura el servicio:

   ```
   Name: cinex-nova-api
   Region: Oregon (US West) o el más cercano
   Branch: main
   Root Directory: api
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

### Paso 3: Configurar Variables de Entorno en Render

En la sección **"Environment Variables"**, agrega:

```
DB_HOST=sql100.infinityfree.com
DB_USER=if0_40527012
DB_PASSWORD=StarCine4729
DB_NAME=if0_40527012_cinex
JWT_SECRET=estosecretoesunapruebapersonal123
```

### Paso 4: Desplegar

1. Click en **"Create Web Service"**
2. Espera a que termine el despliegue (2-5 minutos)
3. **Copia la URL** que te da Render (ej: `https://cinex-nova-api.onrender.com`)

### Paso 5: Verificar que Funciona

Abre en el navegador:
```
https://TU-API.onrender.com
```

Deberías ver: **"API de Cinex Nova funcionando ✅"**

---

## 🎨 PARTE 2: PREPARAR FRONTEND PARA PRODUCCIÓN

### Paso 1: Configurar la URL del Backend

1. Edita el archivo `.env` en la raíz del proyecto:

   ```env
   VITE_NODE_API=https://TU-API.onrender.com
   VITE_USE_REMOTE=true
   ```

   **Reemplaza** `TU-API.onrender.com` con la URL real de Render.

### Paso 2: Generar Build de Producción

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Generar build
npm run build
```

Esto creará una carpeta `dist/` con todos los archivos compilados.

### Paso 3: Verificar el Build

```bash
npm run preview
```

Abre `http://localhost:4173` y verifica que todo funcione correctamente.

---

## 🌐 PARTE 3: DESPLEGAR FRONTEND EN INFINITYFREE

### Opción A: Usar File Manager de InfinityFree

1. Ve a tu panel de control en InfinityFree
2. Click en **"File Manager"** o **"Online File Manager"**
3. Navega a la carpeta `htdocs/` (o `public_html/`)
4. **Elimina** todos los archivos existentes
5. **Sube todos los archivos** de la carpeta `dist/`:
   - Selecciona todos los archivos dentro de `dist/`
   - Súbelos (puede tardar varios minutos)

### Opción B: Usar FTP (Recomendado para archivos grandes)

1. **Descargar un cliente FTP** como [FileZilla](https://filezilla-project.org/)

2. **Conectar por FTP:**
   - Host: `ftpupload.net` (o el que te dé InfinityFree)
   - Usuario: Tu usuario de InfinityFree
   - Contraseña: Tu contraseña FTP
   - Puerto: 21

3. **Subir archivos:**
   - Navega a `htdocs/` en el servidor
   - Arrastra todos los archivos de `dist/` a `htdocs/`

### Paso 4: Configurar .htaccess para React Router

Crea un archivo `.htaccess` en `htdocs/` con este contenido:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

Esto permite que React Router funcione correctamente.

---

## ✅ PARTE 4: VERIFICAR QUE TODO FUNCIONA

### 1. Probar el Backend

```bash
# Endpoint raíz
curl https://TU-API.onrender.com

# Endpoint de login
curl -X POST https://TU-API.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@starlight.com","password":"admin123"}'
```

### 2. Probar el Frontend

1. Abre tu sitio en InfinityFree: `https://TU-SITIO.infinityfreeapp.com`
2. Intenta hacer login
3. Verifica que la comunicación con el backend funcione

### 3. Verificar CORS

Si tienes problemas de CORS:
- Abre la consola del navegador (F12)
- Busca errores de CORS
- Verifica que el backend esté aceptando peticiones desde tu dominio

---

## 🔒 CONFIGURACIÓN DE LA BASE DE DATOS

### Estructura de Tablas Necesarias

#### Tabla `users`

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer', 'administrador', 'cliente') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Insertar Usuarios de Prueba

```sql
-- Administrador
INSERT INTO users (email, password, role)
VALUES ('admin@starlight.com', 'admin123', 'admin');

-- Cliente
INSERT INTO users (email, password, role)
VALUES ('cliente@starlight.com', 'cliente123', 'customer');
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot connect to database"

- Verifica las variables de entorno en Render
- Asegúrate de que la base de datos de InfinityFree esté activa
- Verifica el firewall de InfinityFree (debe permitir conexiones remotas)

### Error: "CORS policy"

- Verifica que el backend tenga CORS configurado correctamente
- El archivo `api/index.js` ya tiene CORS configurado con `origin: '*'`

### Frontend no carga

- Verifica que hayas subido todos los archivos de `dist/`
- Asegúrate de que el archivo `.htaccess` esté en `htdocs/`
- Verifica la consola del navegador para errores

### Error 404 en rutas de React

- Verifica que el archivo `.htaccess` esté configurado correctamente
- Asegúrate de que mod_rewrite esté habilitado en InfinityFree

---

## 📝 NOTAS IMPORTANTES

1. **Render Free Tier**: El servidor se "duerme" después de 15 minutos de inactividad. La primera petición puede tardar 30-60 segundos.

2. **InfinityFree**: Tiene límites de:
   - 10 GB de almacenamiento
   - Ancho de banda ilimitado
   - Sin soporte para Node.js directo (por eso el backend va en Render)

3. **Variables de Entorno**: Nunca subas el archivo `.env` a Git. Usa `.env.example` para documentar.

4. **Actualizaciones**:
   - Backend: Render redespliega automáticamente al hacer `git push`
   - Frontend: Debes hacer `npm run build` y subir manualmente

---

## 🎯 CHECKLIST FINAL

- [ ] Backend desplegado en Render
- [ ] Variables de entorno configuradas en Render
- [ ] Base de datos MySQL funcionando en InfinityFree
- [ ] Usuarios de prueba creados en la base de datos
- [ ] Frontend buildeado con `npm run build`
- [ ] Archivo `.env` configurado con URL de Render
- [ ] Archivos de `dist/` subidos a InfinityFree
- [ ] Archivo `.htaccess` configurado
- [ ] Login funciona correctamente
- [ ] Comunicación frontend-backend verificada

---

## 🆘 SOPORTE

Si encuentras problemas:

1. Revisa los logs en Render: Dashboard → Tu servicio → Logs
2. Revisa la consola del navegador (F12)
3. Verifica que las URLs sean correctas en `.env`
4. Asegúrate de que la base de datos tenga las tablas necesarias

---

## 🎬 ¡LISTO!

Tu aplicación CINEX NOVA ahora está desplegada y funcionando con:
- ✅ Frontend en InfinityFree
- ✅ Backend en Render
- ✅ Base de datos MySQL en InfinityFree
- ✅ Comunicación CORS configurada

**URLs finales:**
- Frontend: `https://tu-sitio.infinityfreeapp.com`
- Backend API: `https://tu-api.onrender.com`

¡Disfruta tu aplicación de cine en producción! 🍿🎥
