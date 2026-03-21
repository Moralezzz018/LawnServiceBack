# Deploy Backend con Docker (seguro y barato)

Esta guía asume:
- Frontend en Cloudflare Pages.
- Backend en un VPS Linux con Docker (2 GB RAM alcanza para empezar).
- Dominio para API: `api.tu-dominio.com`.

## 1) Preparar VPS

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

## 2) Subir código al servidor

```bash
git clone <tu-repo>
cd ProjectoFlores/LawnServiceBack
```

## 3) Configurar variables de entorno

```bash
cp .env.production.example .env.production
```

Edita `.env.production` y define mínimo:
- `CORS_ORIGIN=https://tu-frontend.pages.dev` (o tu dominio final)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (largo y único)
- `OWNER_BOOTSTRAP_KEY` (largo y único)
- `UPLOAD_DIR=/var/www/lawn/uploads`
- Email: configura SOLO `RESEND_*` o SOLO `SMTP_*`

## 4) Configurar dominio de API

Edita `deploy/Caddyfile` y reemplaza:
- `api.tu-dominio.com` por tu subdominio real.

## 5) Configurar DNS (Cloudflare)

En Cloudflare DNS crea:
- Tipo `A`
- Nombre: `api`
- Valor: IP pública de tu VPS

Recomendación para emisión inicial de certificado TLS:
- Deja el proxy de Cloudflare en **DNS only** (nube gris) al inicio.
- Luego de que Caddy emita certificado, puedes activar proxy (nube naranja) si quieres.

## 6) Levantar servicios

```bash
mkdir -p uploads
docker compose up -d --build
```

Verificar logs:

```bash
docker compose logs -f api
docker compose logs -f caddy
```

## 7) Probar salud y API

```bash
curl -I https://api.tu-dominio.com/api/health
```

Debe responder `200`.

## 8) Conectar frontend (Cloudflare Pages)

En variables de entorno del frontend:
- `VITE_API_URL=https://api.tu-dominio.com/api`

Luego redeploy del frontend.

## 9) Seguridad mínima recomendada

- Firewall abierto solo en `22`, `80`, `443`.
- No exponer puerto interno del backend.
- `DB_SYNC=false` en producción.
- Backups de base de datos diarios.
- Mantener Docker y sistema actualizados.

## 10) Operaciones útiles

Reiniciar:

```bash
docker compose restart
```

Actualizar con cambios:

```bash
git pull
docker compose up -d --build
```

Ver estado:

```bash
docker compose ps
```
