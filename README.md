# DRIVO Rent-a-Car 🚗

Sistema de alquiler de autos con gestión de reservas, pagos, mantenimiento y dashboard de reportes.

## Stack

| Capa       | Tecnología                                         |
|------------|-----------------------------------------------------|
| Frontend   | Angular 21, Tailwind CSS, Signals                   |
| Backend    | Java 17, Spring Boot 3.5, JPA, JWT                  |
| BD         | SQL Server 2022 / H2 (dev)                          |
| Infra      | Docker Compose                                      |

## Setup rápido

### Opción 1: Docker Compose (recomendado)

```bash
# 1. Levantar todo (BD + backend + frontend)
docker compose up --build -d

# 2. Crear BD, tablas y datos de prueba (solo primera vez)
docker exec -i drivo-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Drivo2026!" -C < setup.sql

# App en http://localhost
```

### Opción 2: H2 en memoria (desarrollo sin Docker)

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

| Servicio   | URL                              |
|------------|----------------------------------|
| Frontend   | http://localhost                 |
| Backend    | http://localhost:8080            |
| H2 Console | http://localhost:8080/h2-console |
| SQL Server | localhost:1433                   |

## Estructura

```
DRIVO/
├── docker-compose.yml              # Stack completo (BD + backend + frontend)
├── setup.sql                       # Script unificado BD + SPs + seed
├── alquilerauto/                   # Backend Spring Boot
│   ├── Dockerfile                  # Build multi-stage Maven → JRE
│   └── src/main/resources/
│       ├── application.yaml        # Config principal
│       ├── application-h2.yaml     # Perfil H2
│       └── data.sql                # Seed para H2
├── alquilerauto-frontend/          # Frontend Angular
│   ├── Dockerfile                  # Build multi-stage Node → Nginx
│   ├── nginx.conf                  # SPA routing + proxy a backend
│   └── src/
│       ├── app/                    # Componentes y servicios
│       └── environments/           # Config de entorno
├── docs/diagrams/                  # DER y diagrama de arquitectura
└── bruno/                          # Colección Bruno (API tests)
```

## Persistencia

| Dato      | Volumen Docker      | Sobrevive a                  |
|-----------|---------------------|------------------------------|
| BD        | `sqlserver-data`    | `docker compose down`        |
| Fotos     | `uploads-data`      | Reinicio de backend          |

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
