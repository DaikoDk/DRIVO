# DRIVO Rent-a-Car 🚗

Sistema de alquiler de autos con gestión de reservas, pagos, mantenimiento y dashboard de reportes.

## Stack

| Capa       | Tecnología                                         |
|------------|-----------------------------------------------------|
| Frontend   | Angular 21, Tailwind CSS, Signals                   |
| Backend    | Java 17, Spring Boot 3.5, JPA, JWT                  |
| BD         | SQL Server 2022 / H2 (dev)                          |
| Infra      | Docker Compose                                      |

## Setup rápido (3 opciones)

### Opción 1: Docker + SQL Server (recomendado)

```bash
# 1. Levantar SQL Server
docker-compose up -d

# 2. Crear BD, tablas y datos de prueba
sqlcmd -S localhost -U sa -P "Drivo2026!" -i setup.sql

# 3. Configurar .env para el backend
cd alquilerauto
cp .env.example .env
  # Editar DB_RENTCAR, DB_USERNAME, DB_PASSWORD

# 4. Iniciar backend
.\mvnw spring-boot:run

# 5. Iniciar frontend (otra terminal)
cd alquilerauto-frontend
npm install
ng serve
```

### Opción 2: H2 en memoria (sin SQL Server)

```bash
cd alquilerauto
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2
# Frontend igual que arriba
```

### Opción 3: SQL Server local (sin Docker)

Instalar SQL Server 2022, luego ejecutar:

```bash
sqlcmd -S localhost -U sa -P "tuPassword" -i setup.sql
```

## Credenciales default

| Rol      | Email             | Clave       |
|----------|-------------------|-------------|
| ADMIN    | admin@drivo.com   | admin123    |
| CLIENTE  | carlos@email.com  | cliente123  |

## Puerto y URLs

| Servicio   | URL                              |
|------------|----------------------------------|
| Frontend   | http://localhost:4200            |
| Backend    | http://localhost:8080            |
| H2 Console | http://localhost:8080/h2-console |
| SQL Server | localhost:1433                   |

## Estructura

```
DRIVO/
├── alquilerauto/                  # Backend Spring Boot
│   └── src/main/resources/
│       ├── application.yaml       # Config principal
│       ├── application-h2.yaml    # Perfil H2
│       ├── data.sql               # Seed para H2
│       └── bd_rentcar.sql         # Versión anterior (BD sin tb_estado)
├── alquilerauto-frontend/         # Frontend Angular
│   └── src/
│       ├── app/                   # Componentes y servicios
│       └── environments/          # Config de entorno
├── docs/diagrams/                 # DER y diagrama de arquitectura
├── bruno/                         # Colección Bruno (API tests)
├── setup.sql                      # Script unificado BD + SPs + seed
├── DRIVO_BD.sql                   # BD: estructura + seed inicial
├── DRIVO_SP.sql                   # Stored procedures (9 SPs)
├── DRIVO_SEED_MAS_DATOS.sql       # Seed adicional (14 reservas)
└── docker-compose.yml             # SQL Server container
```

## Comandos útiles

```bash
# Backend (perfil SQL Server)
.\mvnw spring-boot:run

# Backend (perfil H2)
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2

# Frontend
cd alquilerauto-frontend && ng serve

# SQL Server en Docker
docker-compose up -d
docker-compose down

# Ejecutar setup.sql en Docker
docker exec -i drivo-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Drivo2026!" -C < setup.sql
```
