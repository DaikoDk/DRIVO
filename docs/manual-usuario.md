# Manual de Usuario — DRIVO Rent-a-Car

## 1. Acceso al Sistema

| Elemento | Valor |
|---|---|
| URL Frontend | http://localhost:4200 |
| URL Backend API | http://localhost:8080 |
| H2 Console | http://localhost:8080/h2-console |

### Credenciales

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | admin@drivo.com | admin123 |
| Cliente | carlos@email.com | cliente123 |

---

## 2. Funcionalidades del Sistema

### 2.1 Login y Seguridad (HU-01)

Al acceder al sistema se presenta la pantalla de login.

1. Ingresar email y contraseña
2. El sistema valida las credenciales contra la base de datos
3. Si son correctas, se genera un token JWT y se redirige al dashboard según el rol
4. Si son incorrectas, se muestra mensaje de error
5. El token JWT expira tras un período de inactividad; el usuario debe volver a iniciar sesión

**Roles del sistema:**
- **ADMIN:** acceso completo a todas las funcionalidades
- **CLIENTE:** acceso al portal de autoservicio (perfil, reservas propias)

---

### 2.2 Gestión de Marcas y Modelos (HU-02)

**Ruta:** Menú lateral → Administración → Marcas / Modelos

- **Listar marcas:** tabla con todas las marcas registradas, filtro de activas
- **Crear marca:** formulario con nombre y país de origen
- **Desactivar marca:** botón de acción que deshabilita la marca (no se elimina)
- **Modelos por marca:** al seleccionar una marca se listan sus modelos
- **Crear modelo:** formulario con nombre, categoría y número de pasajeros

---

### 2.3 Gestión de Vehículos (HU-03)

**Ruta:** Menú lateral → Flota → Vehículos

- **Listar autos:** tabla con placa, marca, modelo, año, color, kilometraje, estado y precios
- **Crear auto:** formulario con placa, marca, modelo, año, color, kilometraje inicial, precios por día/hora, mora por día y revisiones
- **Actualizar auto:** edición de datos del vehículo
- **Desactivar auto:** el vehículo queda inactivo y no aparece en búsquedas
- **Autos disponibles:** filtro de vehículos listos para alquilar, con opción de búsqueda por rango de fechas

---

### 2.4 Gestión de Clientes (HU-04)

**Ruta:** Menú lateral → Clientes

- **Listar clientes:** tabla con nombre, DNI, email, teléfono, estado y número de reservas
- **Crear cliente:** formulario con datos personales, licencia de conducir (número, categoría, vencimiento)
- **Ver cliente:** ficha completa con datos personales, licencia e historial
- **Bloquear cliente:** impide que el cliente realice nuevas reservas (por incidentes)
- **Desactivar cliente:** el cliente queda inactivo en el sistema

---

### 2.5 Reservas (HU-05)

**Ruta:** Menú lateral → Alquiler → Reservas

- **Listar reservas:** tabla con ID, cliente, auto, fechas, horas, estado y total
- **Filtrar por estado:** pendiente, confirmada, en curso, finalizada, cancelada
- **Crear reserva:** seleccionar auto disponible, cliente, rango de fechas y horas. El sistema calcula el subtotal automáticamente según los precios del auto
- **Iniciar reserva (check-in):** el admin registra la fecha/hora real de inicio y el kilometraje inicial del vehículo
- **Finalizar reserva (check-out):** el admin registra la fecha/hora real de devolución, kilometraje final, y el sistema calcula:
  - Subtotal (días × precio por día)
  - Mora (horas de retraso × mora por hora)
  - Daños reportados
  - Total a pagar
- **Cancelar reserva:** solo disponible para reservas en estado pendiente

---

### 2.6 Pagos y Dashboard (HU-06)

**Ruta:** Menú lateral → Pagos / Dashboard

#### Pagos
- **Registrar pago:** asociado a una reserva finalizada, con método de pago (Tarjeta, Efectivo, Transferencia) y desglose de montos
- **Listar pagos:** tabla con ID, reserva, montos y fecha de pago
- **Ver pago:** detalle completo del pago

#### Dashboard
- **Estadísticas generales:** total de reservas activas, ingresos totales del mes, autos disponibles
- **Reservas del día:** lista de reservas que inician o finalizan hoy
- **Vehículos en mantenimiento:** autos que requieren revisión preventiva (próximos a superar el kilometraje de revisión)
- **Ingresos mensuales:** gráfico/lista de ingresos por mes del año actual

---

### 2.7 Reparaciones y Mantenimientos (HU-07)

**Ruta:** Menú lateral → Taller → Reparaciones / Mantenimientos

#### Reparaciones
- **Catálogo de reparaciones:** tipos de reparación con costo estimado y tiempo (ej: rayón de pintura, abolladura)
- **Registrar reparación:** asociada a una reserva y auto, con descripción, costo, responsable (Cliente/Taller)
- **Cambiar estado:** Pendiente → En Proceso → Completada → Cancelada
- **Filtrar por estado:** búsqueda de reparaciones por estado

#### Mantenimientos
- **Registrar mantenimiento:** tipo (Preventivo/Correctivo), auto, fecha de ingreso, costo, detalle
- **Finalizar mantenimiento:** registrar fecha de salida
- **Mantenimientos en curso:** lista de vehículos actualmente en taller

#### Configuraciones
- **Parámetros del sistema:** mora por hora, tiempo de gracia, kilometraje para revisión preventiva
- **CRUD de configuraciones:** crear, listar, eliminar

---

### 2.8 Registro de Cliente (HU-08)

**Ruta:** Pantalla de login → "¿No tienes cuenta? Regístrate"

1. El nuevo cliente completa el formulario de registro:
   - Nombre completo y apellidos
   - DNI
   - Email
   - Teléfono
   - Dirección
   - Licencia de conducir (número, categoría, fecha de vencimiento)
   - Contraseña
2. El sistema valida unicidad de email y DNI
3. Al registrarse exitosamente, el cliente recibe un token JWT e ingresa automáticamente al portal

---

### 2.9 Portal de Autoservicio (HU-09)

**Ruta:** Disponible para usuarios con rol CLIENTE tras iniciar sesión

- **Mi perfil:** consultar y actualizar datos personales
- **Cambiar contraseña:** ingresar contraseña actual y nueva
- **Explorar autos:** ver catálogo de vehículos disponibles con filtro por fechas
- **Crear reserva:** seleccionar auto y fechas para crear una nueva reserva
- **Mis reservas:** historial de reservas del cliente con estado actual
- **Cancelar reserva:** cancelar reservas propias en estado pendiente

---

### 2.10 Asistente Virtual Watson (HU-10)

**Acceso:** Botón flotante de chat en la esquina inferior derecha de todas las pantallas

El asistente virtual responde a consultas en lenguaje natural:

| Intención | Ejemplo de consulta | Respuesta |
|---|---|---|
| Saludo | "Hola", "Buenos días" | Mensaje de bienvenida |
| Disponibilidad | "¿Qué autos hay disponibles?" | Lista de autos disponibles |
| Precios | "¿Cuánto cuesta alquilar un auto?" | Información de precios por día |
| Reservar | "Quiero hacer una reserva" | Instrucciones para reservar |
| Mis reservas | "¿Qué reservas tengo?" | Redirección a portal de reservas |
| Ayuda | "Necesito ayuda" | Información de contacto y soporte |

**Modos de operación:**
- **Online:** conectado a IBM Watson Assistant (requiere credenciales de API)
- **Offline:** respuestas predefinidas por palabras clave cuando no hay conexión a IBM Cloud

---

## 3. Guía de Instalación

### Requisitos previos

- Java 17 (Temurin recomendado)
- Node.js 22+
- npm o pnpm
- Git

### Opción 1: Con H2 (sin instalar SQL Server)

```bash
# 1. Clonar repositorio
git clone https://github.com/DaikoDk/DRIVO.git
cd DRIVO

# 2. Iniciar backend con perfil H2
cd alquilerauto
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2

# 3. Iniciar frontend (otra terminal)
cd alquilerauto-frontend
npm install
ng serve
```

### Opción 2: Con Docker y SQL Server

```bash
# 1. Clonar y levantar BD
git clone https://github.com/DaikoDk/DRIVO.git
cd DRIVO
docker-compose up -d

# 2. Ejecutar script de BD
docker exec -i drivo-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "Drivo2026!" -C < setup.sql

# 3. Iniciar backend
cd alquilerauto
.\mvnw.cmd spring-boot:run

# 4. Iniciar frontend
cd alquilerauto-frontend
npm install
ng serve
```

### Opción 3: Docker Compose (stack completo)

```bash
git clone https://github.com/DaikoDk/DRIVO.git
cd DRIVO

# Un solo comando levanta SQL Server, backend y frontend
docker-compose up -d

# Ejecutar script de BD una sola vez
docker exec -i drivo-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "Drivo2026!" -C < setup.sql
```

### URLs de acceso

| Servicio | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:8080 |
| H2 Console | http://localhost:8080/h2-console |
| SQL Server | localhost:1433 |

---

## 4. Estructura del Proyecto

```
DRIVO/
├── alquilerauto/              # Backend Spring Boot
├── alquilerauto-frontend/     # Frontend Angular
├── bruno/                     # Pruebas de integración API
├── docs/                      # Documentación
│   └── diagrams/              # DER y diagrama de arquitectura
├── .github/workflows/         # Pipeline CI/CD
├── docker-compose.yml         # Stack completo (BD + backend + frontend)
├── Dockerfile                 # Imagen backend (Java 17)
├── alquilerauto-frontend/
│   ├── Dockerfile             # Imagen frontend (Nginx + Angular)
│   └── nginx.conf             # Configuración Nginx para producción
├── .github/workflows/         # Pipeline CI/CD
├── setup.sql                  # Script de base de datos
└── README.md
```
