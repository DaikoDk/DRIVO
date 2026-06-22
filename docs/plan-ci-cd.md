# Plan de Integración Continua — DRIVO Rent-a-Car

## 1. Objetivo

Automatizar la construcción, pruebas y despliegue del proyecto DRIVO Rent-a-Car mediante un pipeline de Integración Continua (CI) que garantice la calidad del código en cada cambio.

---

## 2. Diagrama del Pipeline

```
 ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
 │  Compile │ →  │   Test   │ →  │  Build   │ →  │  Deploy  │
 └──────────┘    └──────────┘    └──────────┘    └──────────┘
   Backend          Backend         Backend        Frontend
   mvn compile      mvn test        mvn package    (Render Static Site)
   Frontend         (H2 profile)    Frontend       Backend
   pnpm install     Frontend        pnpm build     (Render Web Service)
```

---

## 3. Etapas del Pipeline

### Etapa 1: Compilación

| Componente | Comando | Propósito |
|---|---|---|
| Backend | `./mvnw compile` | Compilar código Java y detectar errores de sintaxis |
| Frontend | `npm install && npm run build` | Instalar dependencias y compilar TypeScript/Angular |

### Etapa 2: Pruebas

| Componente | Comando | Perfil | Propósito |
|---|---|---|---|
| Backend | `./mvnw test -Dspring-boot.run.profiles=h2` | H2 en memoria | Ejecutar pruebas unitarias JUnit sin necesidad de SQL Server |
| Frontend | `npm run test -- --watch=false --browsers=ChromeHeadless` | — | Ejecutar pruebas unitarias con Vitest |
| API | `bru run bruno/ --env test` | H2 | Ejecutar colección completa de pruebas de integración API con Bruno CLI |

**Ventaja del perfil H2:** Las pruebas de backend no requieren SQL Server instalado. H2 en memoria con `MODE=MSSQLServer` emula la base de datos de producción.

### Etapa 3: Empaquetado

| Componente | Comando | Artefacto |
|---|---|---|
| Backend | `./mvnw package -DskipTests` | `target/alquilerauto-0.0.1-SNAPSHOT.jar` |
| Frontend | `npm run build -- --configuration=production` | `dist/alquilerauto-frontend/` |

### Etapa 4: Despliegue

| Componente | Plataforma | Método |
|---|---|---|
| Frontend (Angular) | Render Static Site | Conexión directa al repositorio GitHub, build con `pnpm build --configuration=render`, deploy automático en cada push a la rama de despliegue |
| Backend (Spring Boot) | Render Web Service | Dockerfile automático desde el repositorio, perfil `render` con H2 en memoria |
| Base de datos | H2 en memoria (Render) / SQL Server Docker (local) | `application-render.yaml` (H2) o `docker-compose up -d` (SQL Server) |

### Despliegue con Docker

El proyecto incluye Dockerfiles para contenerizar el stack completo:

| Componente | Dockerfile | Descripción |
|---|---|---|
| Backend | `alquilerauto/Dockerfile` | Imagen Java 17 con el JAR empaquetado |
| Frontend | `alquilerauto-frontend/Dockerfile` | Imagen Nginx sirviendo los estáticos de Angular |
| Stack completo | `docker-compose.yml` | Orquesta SQL Server + backend + frontend en una sola red |

```bash
# Despliegue completo con un solo comando
docker compose up -d --build
# Servicios disponibles:
#   Frontend → http://localhost:80
#   Backend  → http://localhost:8080
#   SQL Server → localhost:1434
```

### Despliegue con Docker

El proyecto incluye Dockerfiles para contenerizar el stack completo:

| Componente | Dockerfile | Descripción |
|---|---|---|
| Backend | `alquilerauto/Dockerfile` | Imagen Java 17 con el JAR empaquetado |
| Frontend | `alquilerauto-frontend/Dockerfile` | Imagen Nginx sirviendo los estáticos de Angular |
| Stack completo | `docker-compose.yml` | Orquesta SQL Server + backend + frontend en una sola red |

```bash
# Despliegue completo con un solo comando
docker-compose up -d
# Servicios disponibles:
#   Frontend → http://localhost:4200
#   Backend  → http://localhost:8080
#   SQL Server → localhost:1433
```

---

## 4. Herramientas

| Herramienta | Uso |
|---|---|
| **GitHub Actions** | Orquestador del pipeline CI/CD. Gratuito para repositorios públicos. |
| **Docker / Docker Compose** | Contenedores de SQL Server 2022, backend Spring Boot y frontend Nginx para desarrollo y despliegue. |
| **H2 Database** | Base de datos en memoria para pruebas automatizadas (MODE=MSSQLServer). |
| **Maven Wrapper** (`mvnw`) | Gestión de dependencias y build del backend sin requerir Maven instalado. |
| **npm / pnpm** | Gestión de paquetes del frontend Angular. pnpm 10 para build, corepack para activación. |
| **Bruno CLI** | Ejecución de pruebas de integración API desde línea de comandos. |

---

## 5. Gatillos (Triggers)

| Evento | Acción |
|---|---|
| `push` a `main` o `develop` | Ejecutar pipeline completo: compile → test → build → deploy |
| `pull_request` a `main` | Ejecutar compile + test (sin deploy) |
| `schedule` (diario 6am) | Ejecutar test suite completa para detectar regresiones |

---

## 6. Archivo de Configuración

El pipeline está implementado en `.github/workflows/ci.yml`. Ver el archivo en el repositorio para la configuración ejecutable.

---

## 7. Flujo de Trabajo con Git

```
main ──────────────────────────────────────────────
  │
  ├── feature/hu-01 ──→ PR #76 ──→ merge
  ├── feature/hu-02 ──→ PR #77 ──→ merge
  ├── feature/hu-03 ──→ PR #78 ──→ merge
  ...
  └── feature/hu-12 ──→ PR #120 ──→ merge

Cada PR ejecuta automáticamente:
  ✅ Compilación backend + frontend
  ✅ Pruebas unitarias (JUnit + Vitest)
  ✅ Pruebas de integración API (Bruno)
```

---

## 8. Métricas de Calidad Esperadas

| Métrica | Objetivo |
|---|---|
| Cobertura de pruebas de integración API | 100% de endpoints |
| Tiempo de ejecución del pipeline | < 5 minutos |
| Frecuencia de despliegue | Por cada merge a `main` |
| Tasa de fallos en CI | < 5% |
