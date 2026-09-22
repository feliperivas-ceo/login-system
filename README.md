# Login System — React + NestJS + PostgreSQL

Proyecto base de autenticación listo para desarrollo y preparado para despliegue.

## Stack

- Frontend: React + Vite
- Backend: NestJS + TypeScript
- ORM: Prisma
- DB: PostgreSQL
- Password hashing: Argon2id
- Auth local: access/refresh tokens mediante cookies HttpOnly
- OAuth scaffold: Google, LinkedIn, Facebook y Microsoft
- Docker Compose para PostgreSQL + backend + frontend

## 1. Requisitos

- Docker Desktop
- Node.js 20+ si quieres ejecutar los servicios fuera de Docker
- npm

## 2. Configuración

Copia:

```bash
cp backend/.env.example backend/.env
```

En Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Para desarrollo local, los valores de PostgreSQL incluidos en `.env.example` funcionan con Docker Compose.

## 3. Ejecutar todo con Docker

Desde la raíz:

```bash
docker compose up --build
```

Frontend:

http://localhost:5173

Backend:

http://localhost:3000

Health check:

http://localhost:3000/health

## 4. Ejecutar sin Docker

> Los comandos de Node se ejecutan dentro de `backend` o `frontend`. La raíz del proyecto se usa para Docker Compose.

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 5. Funcionalidad incluida

- Registro con nombre, correo y contraseña.
- Hash de contraseña con Argon2id.
- Login.
- Logout.
- Refresh token rotatorio.
- Endpoint `/auth/me`.
- Validación DTO.
- CORS configurable.
- PostgreSQL mediante Prisma.
- UI similar a la referencia proporcionada.
- Google/LinkedIn/Facebook/Microsoft preparados como endpoints OAuth.

## 6. OAuth

Los proveedores sociales necesitan credenciales creadas en sus respectivas plataformas.

Configura en `backend/.env` las variables de los proveedores que quieras activar.

El proyecto no incluye secretos reales ni credenciales de terceros.

## 7. Producción

Antes de desplegar:

- Cambia todos los secretos.
- Usa HTTPS.
- Cambia `COOKIE_SECURE=true`.
- Configura `FRONTEND_URL` con tu dominio real.
- Usa una base PostgreSQL administrada o un servidor seguro.
- Configura OAuth redirect URLs con tu dominio.
- No subas `.env` a Git.
- Revisa políticas de CORS y cookies.
- Configura backups de PostgreSQL.

## Estructura

```text
login-system/
├── frontend/
├── backend/
├── docker-compose.yml
└── README.md
```


## Redes sociales

Los botones de LinkedIn, Facebook y Microsoft son botones de navegación y abren directamente sus sitios. No autentican al usuario mediante OAuth.

- LinkedIn: https://www.linkedin.com/feed/
- Facebook: https://www.facebook.com/
- Microsoft: https://www.microsoft.com/

Las contraseñas del sistema local continúan almacenándose como hash Argon2id. No se almacenan en texto plano.
