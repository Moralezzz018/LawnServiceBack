# Memphis Lawn Service — Full-Stack Project

> **Monorepo** de la plataforma web de Memphis Lawn Service: sitio público + panel de administración + API REST.

---

## 📂 Estructura del repositorio

```
ProjectoFlores/
├── LawnServiceBack/   # API REST (Node.js + Express + PostgreSQL)
└── LawnServiceFront/  # Aplicación React (Vite + TypeScript + Tailwind)
```

---

## 🌐 Producción

| Servicio | URL |
|---|---|
| **Frontend** | Cloudflare Pages (via `npm run build`) |
| **Backend API** | Render.com (`lawnserviceback.onrender.com`) |
| **Base de datos** | PostgreSQL en Render (adjunto al servicio web) |

---

## 🚀 Levantar entornos

### Backend (API)

```bash
cd LawnServiceBack

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales locales (ver sección Variables de entorno)

# 3. Iniciar en desarrollo (con recarga automática)
npm run dev

# 4. Iniciar en producción
npm start
```

> El servidor escucha por defecto en `http://localhost:4000`

---

### Frontend (React)

```bash
cd LawnServiceFront

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar VITE_API_URL para apuntar a tu backend

# 3. Iniciar en desarrollo
npm run dev
# → http://localhost:5173

# 4. Build de producción
npm run build
# Los archivos se generan en dist/

# 5. Preview del build local
npm run preview
```

---

## ⚙️ Variables de entorno

### Backend (`LawnServiceBack/.env`)

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Base de datos — opción A: URL completa (producción en Render)
DATABASE_URL=

# Base de datos — opción B: parámetros individuales (desarrollo local)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lawn_service
DB_USER=postgres
DB_PASSWORD=postgres
DB_LOGGING=false
DB_SYNC=false
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=true

# JWT
JWT_SECRET=change_this_super_secret_key
JWT_EXPIRES_IN=1d

# Clave para registrar el primer usuario admin
OWNER_BOOTSTRAP_KEY=change_this_bootstrap_key

# Email (Resend o SMTP)
RESEND_API_KEY=
RESEND_FROM=no-reply@yourdomain.com
RESEND_TO=owner@example.com

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# Directorio de uploads (relativo a la raíz del proyecto backend)
UPLOAD_DIR=uploads
```

### Frontend (`LawnServiceFront/.env`)

```env
# URL pública del backend (incluye /api al final)
VITE_API_URL=http://localhost:4000/api
```

> En producción con Render, usa:
> ```
> VITE_API_URL=https://lawnserviceback.onrender.com/api
> ```

---

## 📡 API Endpoints

### Auth
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | Key | Registrar primer admin |
| `POST` | `/api/auth/login` | No | Login admin |

### Galería
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/gallery` | No | Listar imágenes |
| `POST` | `/api/gallery` | Admin | Subir imagen |
| `DELETE` | `/api/gallery/:id` | Admin | Eliminar imagen |
| `PUT` | `/api/gallery/reorder` | Admin | Reordenar galería |

### Testimonios
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/testimonials` | No | Testimonios aprobados (público) |
| `POST` | `/api/testimonials` | No | Enviar nuevo testimonio |
| `GET` | `/api/testimonials/admin` | Admin | Todos (aprobados + pendientes) |
| `PATCH` | `/api/testimonials/:id/approve` | Admin | Aprobar testimonio |
| `DELETE` | `/api/testimonials/:id` | Admin | Eliminar testimonio |

### Citas
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/appointments` | Admin | Listar citas |
| `POST` | `/api/appointments` | No | Crear cita |
| `PATCH` | `/api/appointments/:id/status` | Admin | Actualizar estado |

### Cotizaciones
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/quotes` | Admin | Listar cotizaciones |
| `POST` | `/api/quotes` | Admin | Crear cotización (PDF) |
| `PATCH` | `/api/quotes/:id/status` | Admin | Actualizar estado |

### Precios de Servicios
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/service-prices` | No | Listar precios activos |
| `PUT` | `/api/service-prices/:id` | Admin | Actualizar precio |

---

## 🗄️ Modelos de base de datos

| Modelo | Tabla | Descripción |
|--------|-------|-------------|
| `User` | `users` | Usuarios admin |
| `GalleryImage` | `gallery_images` | Imágenes de galería |
| `Testimonial` | `testimonials` | Testimonios de clientes |
| `Appointment` | `appointments` | Solicitudes de citas |
| `Quote` | `quotes` | Cotizaciones generadas |
| `ServicePrice` | `service_prices` | Precios de servicios |

> Las tablas se crean/migran automáticamente con `sync({ alter: true })` al iniciar el servidor.

---

## 🎯 Módulos del panel de administración

| Módulo | Descripción |
|--------|-------------|
| **Clientes** | Gestión de precios de servicios + generación de cotizaciones PDF + búsqueda de citas |
| **Galería** | Subida (cámara o galería), categorización, reordenamiento y eliminación de imágenes |
| **Análisis** | Dashboard con métricas: citas, cotizaciones, conversión e ingresos |
| **Testimonios** | Revisión, aprobación y eliminación de testimonios enviados por clientes |

---

## 🔒 Flujo de testimonios

```
Cliente envía testimonio (POST /api/testimonials)
         ↓
  approved = false  →  No visible en el sitio público
         ↓
  Admin lo revisa en Módulo Testimonios
         ↓
  Admin aprueba (PATCH /api/testimonials/:id/approve)
         ↓
  approved = true  →  Aparece en la sección pública
```

---

## 🏗️ Stack tecnológico

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4
- **ORM**: Sequelize 6 + PostgreSQL
- **Auth**: Passport.js (JWT)
- **Validación**: express-validator
- **Email**: Resend / Nodemailer
- **Uploads**: Multer

### Frontend
- **Framework**: React 18 + TypeScript
- **Build tool**: Vite 6
- **Estilos**: Tailwind CSS v4
- **Componentes UI**: Radix UI / shadcn/ui
- **Iconos**: Lucide React

---

## 📋 Despliegue en producción

### Backend en Render

1. Crear un **Web Service** conectando el repo de GitHub
2. Build command: `npm install`
3. Start command: `npm start`
4. Agregar variables de entorno (ver sección anterior)
5. Adjuntar una **PostgreSQL** database en Render y copiar la `DATABASE_URL`

### Frontend en Cloudflare Pages

1. Conectar el repo a Cloudflare Pages
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Configurar variable de entorno:
   ```
   VITE_API_URL=https://lawnserviceback.onrender.com/api
   ```
5. Deploy

---

## 🧰 Comandos útiles

```bash
# Verificar sintaxis del backend sin dependencias
node --check src/server.js

# Build del frontend
cd LawnServiceFront && npm run build

# Listar archivos del proyecto (excluyendo node_modules)
find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*"
```

---

## 📌 Notas importantes

- El primer usuario admin se registra via `POST /api/auth/register` con el `OWNER_BOOTSTRAP_KEY`.
- Los testimonios nuevos de clientes requieren **aprobación manual** del admin antes de mostrarse públicamente.
- Las imágenes subidas localmente se almacenan en `uploads/gallery/`. En producción (Render con disco efímero), considera usar un servicio de almacenamiento externo (Cloudinary, S3).
- El intervalo de auto-refresh en el panel de análisis es de **20 segundos**.
