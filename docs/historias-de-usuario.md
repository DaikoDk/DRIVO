# Historias de Usuario — DRIVO Rent-a-Car

## Resumen

| ID | Historia de Usuario | SP | Prioridad | Asignado | Sub-tareas | PR |
|---|---|---|---|---|---|---|
| HU-01 | Security + JWT + Login Backend | 8 | P0 | DaikoDk | 5/5 (100%) | [#76](https://github.com/DaikoDk/DRIVO/pull/76) |
| HU-02 | Marcas + Modelos + ResponseWrapper | 5 | P0 | edgaradrianmora | 8/8 (100%) | [#77](https://github.com/DaikoDk/DRIVO/pull/77) |
| HU-03 | Vehículos - Autos | 5 | P0 | DaikoDk | 5/5 (100%) | [#78](https://github.com/DaikoDk/DRIVO/pull/78) |
| HU-04 | Clientes + Licencias | 5 | P0 | Stronghold321 | 6/6 (100%) | [#79](https://github.com/DaikoDk/DRIVO/pull/79) |
| HU-05 | Reservas | 8 | P0 | DaikoDk | 8/8 (100%) | [#81](https://github.com/DaikoDk/DRIVO/pull/81) |
| HU-06 | Pagos + Dashboard | 6 | P1 | edgaradrianmora | 7/7 (100%) | [#96](https://github.com/DaikoDk/DRIVO/pull/96) |
| HU-07 | Reparaciones + Mantenimientos + Configuración | 6 | P0 | Stronghold321 | 8/8 (100%) | [#82](https://github.com/DaikoDk/DRIVO/pull/82) |
| HU-08 | Registro Cliente + Role Routing Backend | 5 | P0 | Stronghold321 | 6/6 (100%) | [#84](https://github.com/DaikoDk/DRIVO/pull/84) |
| HU-09 | Portal Ecommerce Backend | 8 | P0 | DaikoDk | 7/7 (100%) | [#85](https://github.com/DaikoDk/DRIVO/pull/85) |
| HU-10 | Watson Assistant | 5 | P2 | DaikoDk | 6/6 (100%) | [#108](https://github.com/DaikoDk/DRIVO/pull/108) |
| HU-11 | Conectar Frontend al Backend | 6 | — | — | 6/6 (100%) | [#93](https://github.com/DaikoDk/DRIVO/pull/93) |
| HU-12 | Flujo de entrega y pago de reserva | — | — | — | 1/2 (50%) | [#120](https://github.com/DaikoDk/DRIVO/pull/120) |

**Total: 61+ Story Points | 12 Historias de Usuario | 3 desarrolladores**

---

## Detalle por Historia de Usuario

### HU-01: Security + JWT + Login Backend
- **Descripción:** Implementar autenticación de usuarios con Spring Security y JWT. Login con credenciales, generación de token JWT, protección de endpoints según roles (ADMIN/CLIENTE), manejo de token expirado y malformado.
- **Story Points:** 8 | **Prioridad:** P0
- **Asignado:** DaikoDk | **PR:** [#76](https://github.com/DaikoDk/DRIVO/pull/76)
- **Criterios de aceptación:**
  - Login exitoso retorna token JWT con rol del usuario
  - Login fallido retorna 401 Unauthorized
  - Endpoints protegidos rechazan solicitudes sin token
  - Token expirado retorna 403 Forbidden
  - Token malformado retorna 403 Forbidden

### HU-02: Marcas + Modelos + ResponseWrapper
- **Descripción:** CRUD de marcas y modelos de vehículos con envoltura estandarizada de respuestas API (ResponseWrapper). Gestión de catálogo con activación/desactivación.
- **Story Points:** 5 | **Prioridad:** P0
- **Asignado:** edgaradrianmora | **PR:** [#77](https://github.com/DaikoDk/DRIVO/pull/77)
- **Criterios de aceptación:**
  - Crear, listar, obtener y desactivar marcas
  - Crear y listar modelos asociados a una marca
  - Validar unicidad de nombre de marca
  - ResponseWrapper estandarizado en todas las respuestas
  - Filtro de registros activos

### HU-03: Vehículos - Autos
- **Descripción:** Gestión completa del catálogo de vehículos. CRUD con campos como placa, kilometraje, precio por día/hora, mora, revisiones. Búsqueda de autos disponibles por rango de fechas.
- **Story Points:** 5 | **Prioridad:** P0
- **Asignado:** DaikoDk | **PR:** [#78](https://github.com/DaikoDk/DRIVO/pull/78)
- **Criterios de aceptación:**
  - Crear auto con placa, marca, modelo, precios y estado
  - Validar unicidad de placa
  - Listar autos activos y disponibles
  - Filtrar autos disponibles en un rango de fechas
  - Actualizar datos del auto y desactivarlo

### HU-04: Clientes + Licencias
- **Descripción:** Registro y gestión de clientes con datos personales (DNI, email) y licencia de conducir asociada. Control de bloqueo por incidentes.
- **Story Points:** 5 | **Prioridad:** P0
- **Asignado:** Stronghold321 | **PR:** [#79](https://github.com/DaikoDk/DRIVO/pull/79)
- **Criterios de aceptación:**
  - Crear cliente con licencia, DNI, email y datos personales
  - Validar unicidad de DNI y email
  - Listar clientes activos y obtener por ID
  - Bloquear/desbloquear cliente por incidentes
  - Desactivar cliente

### HU-05: Reservas
- **Descripción:** Ciclo completo de alquiler: crear reserva, validar solapamiento de fechas, iniciar alquiler (check-in), finalizar (check-out) con cálculo de kilometraje, y cancelar reservas pendientes.
- **Story Points:** 8 | **Prioridad:** P0
- **Asignado:** DaikoDk | **PR:** [#81](https://github.com/DaikoDk/DRIVO/pull/81)
- **Criterios de aceptación:**
  - Crear reserva con fechas, horas, auto y cliente
  - Validar que no haya solapamiento de reservas del mismo auto
  - Iniciar reserva (check-in: registra fecha/hora real y kilometraje inicial)
  - Finalizar reserva (check-out: calcula subtotal, mora, daños, total)
  - Cancelar reserva en estado pendiente
  - No permitir cancelar reserva en curso
  - Listar reservas y filtrar por estado

### HU-06: Pagos + Dashboard
- **Descripción:** Procesamiento de pagos de alquiler con cálculo de montos (base, mora, daños). Dashboard con estadísticas: reservas del día, vehículos próximos a mantenimiento, ingresos mensuales.
- **Story Points:** 6 | **Prioridad:** P1
- **Asignado:** edgaradrianmora | **PR:** [#96](https://github.com/DaikoDk/DRIVO/pull/96)
- **Criterios de aceptación:**
  - Registrar pago asociado a una reserva con desglose de montos
  - Listar pagos, obtener por ID y por reserva
  - Dashboard: total de reservas activas, ingresos totales, autos disponibles
  - Dashboard: reservas del día actual
  - Dashboard: vehículos que requieren mantenimiento preventivo
  - Dashboard: ingresos mensuales del año actual

### HU-07: Reparaciones + Mantenimientos + Configuración
- **Descripción:** Registro de reparaciones de vehículos con catálogo de tipos, cambio de estado (pendiente → en proceso → completada). Registro de mantenimientos preventivos/correctivos con kilometraje. Configuración de parámetros del sistema (mora, tiempos, revisiones).
- **Story Points:** 6 | **Prioridad:** P0
- **Asignado:** Stronghold321 | **PR:** [#82](https://github.com/DaikoDk/DRIVO/pull/82)
- **Criterios de aceptación:**
  - Catálogo de reparaciones con costo y tiempo estimado
  - Registrar reparación asociada a reserva y auto
  - Cambiar estado de reparación (pendiente → en proceso → completada)
  - Validar responsable (Cliente/Taller)
  - Registrar mantenimiento con tipo, costo y kilometraje
  - Finalizar mantenimiento con fecha de salida
  - CRUD de configuraciones del sistema con validación de unicidad

### HU-08: Registro Cliente + Role Routing Backend
- **Descripción:** Registro público de nuevos clientes con auto-login mediante JWT. Validaciones de email único, DNI único, longitud de contraseña. Protección de rutas por rol en el backend.
- **Story Points:** 5 | **Prioridad:** P0
- **Asignado:** Stronghold321 | **PR:** [#84](https://github.com/DaikoDk/DRIVO/pull/84)
- **Criterios de aceptación:**
  - Registro exitoso con datos completos (incluyendo licencia)
  - Login inmediato tras registro (retorna JWT)
  - Validar email duplicado, DNI duplicado
  - Validar longitud mínima de contraseña
  - Validar campos obligatorios (email, DNI)
  - Role-based routing en backend

### HU-09: Portal Ecommerce Backend
- **Descripción:** Endpoints para el portal de autoservicio del cliente: ver perfil, actualizar datos, consultar autos disponibles, crear reservas desde el portal, ver historial de reservas, cambiar contraseña y cancelar reservas propias.
- **Story Points:** 8 | **Prioridad:** P0
- **Asignado:** DaikoDk | **PR:** [#85](https://github.com/DaikoDk/DRIVO/pull/85)
- **Criterios de aceptación:**
  - Cliente consulta su perfil (`GET /api/clientes/me`)
  - Cliente actualiza sus datos personales
  - Cliente consulta auto por ID (endpoint público)
  - Cliente crea reserva desde el portal
  - Cliente lista sus reservas
  - Cliente cambia su contraseña (validando contraseña actual)
  - Cliente cancela sus propias reservas pendientes

### HU-10: Watson Assistant
- **Descripción:** Integración con IBM Watson Assistant como chatbot de atención al cliente. Modo online (API real de IBM Cloud) y modo offline (respuestas predefinidas por palabras clave). El asistente responde sobre disponibilidad, precios, reservas, pagos y ayuda general.
- **Story Points:** 5 | **Prioridad:** P2
- **Asignado:** DaikoDk | **PR:** [#108](https://github.com/DaikoDk/DRIVO/pull/108)
- **Criterios de aceptación:**
  - Chatbot funcional en el frontend (widget flotante)
  - Modo online: conexión real a IBM Watson Assistant API v2
  - Modo offline: respuestas por palabras clave (saludo, despedida, disponibilidad, precios, reservar, ayuda)
  - Endpoint público `POST /api/watson/message`
  - Configuración por variables de entorno (`WATSON_API_KEY`, `WATSON_URL`, `WATSON_ASSISTANT_ID`)

### HU-11: Conectar Frontend al Backend
- **Descripción:** Sincronización de APIs entre el frontend Angular y el backend Spring Boot. Corrección de CORS, mapeo de endpoints, ajuste de DTOs y servicios HTTP en el frontend.
- **Story Points:** 6
- **PR:** [#93](https://github.com/DaikoDk/DRIVO/pull/93)
- **Criterios de aceptación:**
  - Frontend consume todos los endpoints del backend sin errores CORS
  - Servicios Angular mapeados a los controladores REST
  - Flujos completos funcionales (login → CRUD → reservas → pagos)

### HU-12: Flujo de entrega y pago de reserva
- **Descripción:** Completar el flujo de entrega de vehículo y procesamiento de pago desde el frontend. Integración del ciclo completo: reserva → check-in → check-out → pago.
- **PR:** [#120](https://github.com/DaikoDk/DRIVO/pull/120)
- **Criterios de aceptación:**
  - Flujo de entrega con registro de kilometraje y observaciones
  - Procesamiento de pago con cálculo de totales
  - Actualización de estado de reserva post-pago
