# LawnServiceBack

Backend base para Memphis Lawn Service, diseñado para soportar:
- Formulario público de citas (con envío de correo usando Resend)
- Módulo privado de cotizaciones para dueño (con login)

## Stack implementado
- Node.js + Express
- PostgreSQL + Sequelize
- express-validator
- multer
- argon2
- passport + jsonwebtoken
- nodemailer
- nodemon
- Resend (para notificaciones de citas)

## Estructura

```text
src/
  app.js
  server.js
  routes.js
  config/
    env.js
    passport.js
  db/
    sequelize.js
    models/
      index.js
      user.model.js
      appointment.model.js
      quote.model.js
  middlewares/
    authOwner.js
    errorHandler.js
    upload.js
    validateRequest.js
  modules/
    auth/
    appointments/
    quotes/
  services/
    email.service.js
  utils/
    jwt.js
```

## Variables de entorno
1. Copia `.env.example` a `.env`
2. Configura base de datos, JWT y correo.

### Producción (recomendado)
- Usa como base `.env.production.example`.
- Configura `CORS_ORIGIN` con el dominio real del frontend.
- Usa `JWT_SECRET` y `OWNER_BOOTSTRAP_KEY` largos y únicos.
- Mantén `DB_SYNC=false` en producción.
- Define `UPLOAD_DIR` en una ruta persistente (volumen/disco estable).
- Configura un solo proveedor de correo: Resend o SMTP.

## Scripts
- `npm run dev` -> modo desarrollo con nodemon
- `npm start` -> modo producción

## Endpoints iniciales
- `GET /api/health`
- `POST /api/auth/register-owner`
- `POST /api/auth/login`
- `GET /api/auth/me` (owner)
- `POST /api/appointments` (público)
- `GET /api/appointments` (owner)
- `GET /api/quotes` (owner)
- `POST /api/quotes` (owner)
- `PATCH /api/quotes/:id/status` (owner)

## Flujo recomendado para comenzar
1. Crear DB en PostgreSQL.
2. Configurar `.env`.
3. Ejecutar `npm install`.
4. Ejecutar `npm run dev`.
5. Registrar primer owner con `/api/auth/register-owner` usando `OWNER_BOOTSTRAP_KEY`.
6. Loguear owner y usar token Bearer para endpoints privados.

## Checklist previa a deploy
1. Backend responde `GET /api/health` en entorno productivo.
2. Frontend (dominio real) coincide con `CORS_ORIGIN`.
3. DB productiva accesible y con credenciales correctas.
4. Variables críticas definidas: `JWT_SECRET`, `OWNER_BOOTSTRAP_KEY`.
5. Ruta de uploads persistente y con permisos de escritura.
6. Probar login admin, crear cita, crear cotización y subir imagen de galería.
