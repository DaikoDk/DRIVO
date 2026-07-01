# DRIVO Rent-a-Car

[![CI](https://img.shields.io/github/actions/workflow/status/DaikoDk/DRIVO/ci.yml?label=CI&logo=githubactions)](https://github.com/DaikoDk/DRIVO/actions)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk)](https://adoptium.net)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?logo=springboot)](https://spring.io)
[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)](https://angular.dev)
[![Docker](https://img.shields.io/badge/Docker-✓-2496ED?logo=docker)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](LICENSE)

Car rental system with reservation management, payments, maintenance, and reporting dashboard.

[🇪🇸 Leer en español](#versión-en-español)

---

## Stack

| Layer    | Technology                                       |
|----------|--------------------------------------------------|
| Frontend | Angular 21, Tailwind CSS, Signals                |
| Backend  | Java 17, Spring Boot 3.5, JPA, JWT               |
| Database | SQL Server 2022 / H2 (dev)                       |
| Infra    | Docker Compose, Render (Web Service + Static Site)|

## Quick Start

### Option 1: Render (production — no setup)

| Service | URL |
|---|---|
| Frontend | `https://drivo-1-lsbr.onrender.com` |
| Backend API | `https://drivo-8ti4.onrender.com/api` |

The backend sleeps after 15 min of inactivity (free plan). First visit of the day takes ~50s to respond. *

### Option 2: Docker Compose (recommended)

```bash
# 1. (Optional) Customize credentials
cp alquilerauto/.env.example alquilerauto/.env
# Edit .env with your values

# 2. Start everything (DB + backend + frontend)
docker compose up --build -d

# 3. Create DB, tables and test data (first time only)
docker exec -i drivo-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Drivo2026!" -C < setup.sql

# App at http://localhost
```

### Option 3: H2 in-memory (development without Docker)

```bash
cd alquilerauto
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2

cd alquilerauto-frontend
pnpm install
ng serve
```

## Default Credentials

| Role   | Email            | Password  |
|--------|------------------|-----------|
| ADMIN  | admin@drivo.com  | admin123  |
| CLIENT | carlos@email.com | cliente123 |

## URLs

### Local (Docker Compose)

| Service    | URL                               |
|------------|-----------------------------------|
| Frontend   | http://localhost                   |
| Backend    | http://localhost:8080              |
| H2 Console | http://localhost:8080/h2-console   |

### Production (Render)

| Service    | URL                                            |
|------------|------------------------------------------------|
| Frontend   | https://drivo-1-lsbr.onrender.com              |
| Backend    | https://drivo-8ti4.onrender.com                |
| H2 Console | https://drivo-8ti4.onrender.com/h2-console     |

## Project Structure

```
DRIVO/
├── docker-compose.yml              # Full stack (DB + backend + frontend)
├── setup.sql                       # Unified DB script + SPs + seed
├── alquilerauto/                   # Spring Boot backend
│   ├── Dockerfile                  # Multi-stage Maven → JRE build
│   └── src/main/resources/
│       ├── application.yaml        # Main config
│       ├── application-h2.yaml     # H2 profile (local dev)
│       ├── application-render.yaml # H2 profile (Render production)
│       └── data.sql                # H2 seed data
├── alquilerauto-frontend/          # Angular frontend
│   ├── Dockerfile                  # Multi-stage Node → Nginx build
│   ├── nginx.conf                  # SPA routing + backend proxy
│   └── src/
│       ├── app/                    # Components and services
│       └── environments/           # Environment config (dev, prod, render)
├── docs/diagrams/                  # ERD and architecture diagrams
└── bruno/                          # Bruno collection (API tests)
```

## Persistence

### Docker Compose (local)

| Data      | Docker Volume     | Survives                      |
|-----------|-------------------|-------------------------------|
| DB        | `sqlserver-data`  | `docker compose down`         |
| Photos    | `uploads-data`    | Backend restart               |

### Render (production)

| Data      | Persistence                                           |
|-----------|-------------------------------------------------------|
| DB        | H2 in-memory — lost on sleep/wake *                  |
| Seed data | `data.sql` reloads automatically on each startup      |
| Photos    | Not persisted — lost on restart *                     |

> * Render's free plan uses in-memory H2 and ephemeral disk. Uploaded photos and data are lost when the service restarts. For real persistence, SQL Server + external storage (S3, Cloudinary, etc.) is required.

## Useful Commands

```bash
# Full stack (production)
docker compose up --build -d
docker compose down

# Run setup.sql against the DB
docker exec -i drivo-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Drivo2026!" -C < setup.sql

# Backend only (development with SQL Server in Docker)
cd alquilerauto && .\mvnw spring-boot:run

# Backend only (development with H2)
cd alquilerauto && .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2

# Frontend only (development)
cd alquilerauto-frontend && ng serve
```

## License

MIT

---
---

# Versión en español

Sistema de alquiler de autos con gestión de reservas, pagos, mantenimiento y dashboard de reportes.

---

## Stack

| Capa       | Tecnología                                         |
|------------|-----------------------------------------------------|
| Frontend   | Angular 21, Tailwind CSS, Signals                   |
| Backend    | Java 17, Spring Boot 3.5, JPA, JWT                  |
| BD         | SQL Server 2022 / H2 (dev)                          |
| Infra      | Docker Compose, Render (Web Service + Static Site)   |

## Setup rápido

### Opción 1: Render (producción — sin setup)

| Servicio | URL |
|---|---|
| Frontend | `https://drivo-1-lsbr.onrender.com` |
| Backend API | `https://drivo-8ti4.onrender.com/api` |

El backend duerme tras 15 min de inactividad (plan gratuito). Primera visita del día tarda ~50s en responder. *

### Opción 2: Docker Compose (recomendado)

```bash
# 1. (Opcional) Personalizar credenciales
cp alquilerauto/.env.example alquilerauto/.env
# Editar .env con tus valores

# 2. Levantar todo (BD + backend + frontend)
docker compose up --build -d

# 3. Crear BD, tablas y datos de prueba (solo primera vez)
docker exec -i drivo-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Drivo2026!" -C < setup.sql

# App en http://localhost
```

### Opción 3: H2 en memoria (desarrollo sin Docker)

```bash
cd alquilerauto
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2

cd alquilerauto-frontend
pnpm install
ng serve
```

## Credenciales default

| Rol      | Email             | Clave       |
|----------|-------------------|-------------|
| ADMIN    | admin@drivo.com   | admin123    |
| CLIENTE  | carlos@email.com  | cliente123  |

## Puerto y URLs

### Local (Docker Compose)

| Servicio   | URL                              |
|------------|----------------------------------|
| Frontend   | http://localhost                 |
| Backend    | http://localhost:8080            |
| H2 Console | http://localhost:8080/h2-console |

### Producción (Render)

| Servicio   | URL                                        |
|------------|--------------------------------------------|
| Frontend   | https://drivo-1-lsbr.onrender.com          |
| Backend    | https://drivo-8ti4.onrender.com            |
| H2 Console | https://drivo-8ti4.onrender.com/h2-console |

## Estructura

```
DRIVO/
├── docker-compose.yml              # Stack completo (BD + backend + frontend)
├── setup.sql                       # Script unificado BD + SPs + seed
├── alquilerauto/                   # Backend Spring Boot
│   ├── Dockerfile                  # Build multi-stage Maven → JRE
│   └── src/main/resources/
│       ├── application.yaml        # Config principal
│       ├── application-h2.yaml     # Perfil H2 (desarrollo local)
│       ├── application-render.yaml # Perfil H2 (producción Render)
│       └── data.sql                # Seed para H2
├── alquilerauto-frontend/          # Frontend Angular
│   ├── Dockerfile                  # Build multi-stage Node → Nginx
│   ├── nginx.conf                  # SPA routing + proxy a backend
│   └── src/
│       ├── app/                    # Componentes y servicios
│       └── environments/           # Config de entorno (dev, prod, render)
├── docs/diagrams/                  # DER y diagrama de arquitectura
└── bruno/                          # Colección Bruno (API tests)
```

## Persistencia

### Docker Compose (local)

| Dato      | Volumen Docker      | Sobrevive a                  |
|-----------|---------------------|------------------------------|
| BD        | `sqlserver-data`    | `docker compose down`        |
| Fotos     | `uploads-data`      | Reinicio de backend          |

### Render (producción)

| Dato      | Persistencia                                         |
|-----------|------------------------------------------------------|
| BD        | H2 en memoria — se pierde al dormir/despertar \*     |
| Seed data | `data.sql` se recarga automáticamente en cada inicio |
| Fotos     | No persisten — se pierden al reiniciar \*            |

> \* El plan gratuito de Render usa H2 en memoria y disco efímero. Las fotos subidas y los datos se pierden al reiniciar el servicio. Para persistencia real se requiere SQL Server + almacenamiento externo (S3, Cloudinary, etc.).

## Comandos útiles

```bash
# Stack completo (producción)
docker compose up --build -d
docker compose down

# Ejecutar setup.sql contra la BD
docker exec -i drivo-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Drivo2026!" -C < setup.sql

# Backend solo (desarrollo con SQL Server en Docker)
cd alquilerauto && .\mvnw spring-boot:run

# Backend solo (desarrollo con H2)
cd alquilerauto && .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2

# Frontend solo (desarrollo)
cd alquilerauto-frontend && ng serve
```

## License

MIT
