# Plan de Pruebas — DRIVO Rent-a-Car

## 1. Estrategia de Pruebas

| Tipo | Herramienta | Alcance |
|---|---|---|
| Pruebas unitarias | JUnit 5 (Spring Boot Test) | Carga de contexto de la aplicación |
| Pruebas de integración API | Bruno | 101 casos cubriendo 9 Historias de Usuario |
| Pruebas de aceptación | Manual + Bruno | Validación de criterios de aceptación por HU |

**Enfoque:** Cada HU tiene una colección de pruebas de integración API en `bruno/HU-XX/` que validan:
- Casos felices (happy path)
- Casos de error (validaciones, duplicados, permisos)
- Seguridad (tokens JWT: sin token, expirado, malformado)

---

## 2. Cobertura por Historia de Usuario

| HU | Descripción | Casos | Happy Path | Error | Seguridad |
|---|---|---|---|---|---|
| HU-01 | Security + JWT + Login | 6 | 2 | 1 | 3 |
| HU-02 | Marcas + Modelos | 11 | 5 | 2 | 4 |
| HU-03 | Vehículos - Autos | 11 | 6 | 2 | 3 |
| HU-04 | Clientes + Licencias | 10 | 4 | 3 | 3 |
| HU-05 | Reservas | 15 | 6 | 4 | 5 |
| HU-06 | Pagos + Dashboard | 15 | 8 | 3 | 4 |
| HU-07 | Reparaciones + Mantenimientos | 16 | 9 | 5 | 2 |
| HU-08 | Registro Cliente | 8 | 2 | 6 | 0 |
| HU-09 | Portal Ecommerce | 9 | 6 | 3 | 0 |
| **Total** | | **101** | **48** | **29** | **24** |

---

## 3. Casos de Prueba por HU

### HU-01: Security + JWT + Login Backend

| TC-ID | Nombre | Endpoint | Esperado |
|---|---|---|---|
| TC-01-01 | Login Exitoso | POST /api/auth/login | 200 + token JWT con rol |
| TC-01-02 | Login Fallido | POST /api/auth/login | 401 Unauthorized |
| TC-01-03 | Autos Sin Token | GET /api/autos | 403 Forbidden |
| TC-01-04 | Autos Con Token | GET /api/autos | 200 + lista de autos |
| TC-01-05 | Token Expirado | GET /api/autos | 403 Forbidden |
| TC-01-06 | Token Malformado | GET /api/autos | 403 Forbidden |

### HU-02: Marcas + Modelos + ResponseWrapper

| TC-ID | Nombre | Endpoint | Esperado |
|---|---|---|---|
| TC-02-01 | Login Admin | POST /api/auth/login | 200 + token admin |
| TC-02-02 | Crear Marca | POST /api/marcas | 201 + ResponseWrapper |
| TC-02-03 | Crear Marca Duplicada | POST /api/marcas | 409 Conflict |
| TC-02-04 | Listar Marcas Activas | GET /api/marcas | 200 + lista |
| TC-02-05 | Obtener Marca Por ID | GET /api/marcas/{id} | 200 + marca |
| TC-02-06 | Desactivar Marca | DELETE /api/marcas/{id} | 200 + desactivada |
| TC-02-07 | Listar Modelos Por Marca | GET /api/modelos/marca/{id} | 200 + lista |
| TC-02-08 | Listar Modelos Activos | GET /api/modelos | 200 + lista |
| TC-02-09 | Crear Modelo | POST /api/modelos | 201 + ResponseWrapper |
| TC-02-10 | GET Sin Token | GET /api/marcas | 403 Forbidden |
| TC-02-11 | POST Sin Token | POST /api/marcas | 403 Forbidden |

### HU-03: Vehículos - Autos

| TC-ID | Nombre | Endpoint | Esperado |
|---|---|---|---|
| TC-03-01 | Login Admin | POST /api/auth/login | 200 + token admin |
| TC-03-02 | Crear Auto | POST /api/autos | 201 |
| TC-03-03 | Crear Auto Placa Duplicada | POST /api/autos | 409 Conflict |
| TC-03-04 | Listar Autos Activos | GET /api/autos | 200 + lista |
| TC-03-05 | Obtener Auto Por ID | GET /api/autos/{id} | 200 + auto |
| TC-03-06 | Autos Disponibles | GET /api/autos/disponibles | 200 + lista |
| TC-03-07 | Autos Disponibles Rango | GET /api/autos/disponibles?fechaInicio=...&fechaFin=... | 200 + filtrados |
| TC-03-08 | Actualizar Auto | PUT /api/autos/{id} | 200 + actualizado |
| TC-03-09 | Desactivar Auto | DELETE /api/autos/{id} | 200 + desactivado |
| TC-03-10 | GET Sin Token | GET /api/autos | 403 Forbidden |
| TC-03-11 | POST Sin Token | POST /api/autos | 403 Forbidden |

### HU-04: Clientes + Licencias

| TC-ID | Nombre | Endpoint | Esperado |
|---|---|---|---|
| TC-04-01 | Login Admin | POST /api/auth/login | 200 + token admin |
| TC-04-02 | Crear Cliente Con Licencia | POST /api/clientes | 201 |
| TC-04-03 | Crear Cliente DNI Duplicado | POST /api/clientes | 409 Conflict |
| TC-04-04 | Crear Cliente Email Duplicado | POST /api/clientes | 409 Conflict |
| TC-04-05 | Listar Clientes Activos | GET /api/clientes | 200 + lista |
| TC-04-06 | Obtener Cliente Por ID | GET /api/clientes/{id} | 200 + cliente |
| TC-04-07 | Bloquear Cliente | PUT /api/clientes/{id}/bloquear | 200 + bloqueado |
| TC-04-08 | Desactivar Cliente | DELETE /api/clientes/{id} | 200 + desactivado |
| TC-04-09 | GET Sin Token | GET /api/clientes | 403 Forbidden |
| TC-04-10 | POST Sin Token | POST /api/clientes | 403 Forbidden |

### HU-05: Reservas

| TC-ID | Nombre | Endpoint | Esperado |
|---|---|---|---|
| TC-05-01 | Login Admin | POST /api/auth/login | 200 + token admin |
| TC-05-02 | Crear Reserva | POST /api/reservas | 201 |
| TC-05-03 | Guardar ID Primera Reserva | — | Variable de entorno |
| TC-05-04 | Crear Reserva Solapada | POST /api/reservas | 409 Conflict |
| TC-05-05 | Crear Reserva Fecha Inválida | POST /api/reservas | 400 Bad Request |
| TC-05-06 | Iniciar Reserva | PUT /api/reservas/{id}/iniciar | 200 + iniciada |
| TC-05-07 | Finalizar Reserva | PUT /api/reservas/{id}/finalizar | 200 + finalizada |
| TC-05-08 | Crear Segunda Reserva | POST /api/reservas | 201 |
| TC-05-09 | Guardar ID Segunda Reserva | — | Variable de entorno |
| TC-05-10 | Cancelar Reserva Pendiente | PUT /api/reservas/{id}/cancelar | 200 + cancelada |
| TC-05-11 | Cancelar En Proceso - Debe Fallar | PUT /api/reservas/{id}/cancelar | 400 Bad Request |
| TC-05-12 | Listar Reservas | GET /api/reservas | 200 + lista |
| TC-05-13 | Filtrar por Estado | GET /api/reservas?estado=... | 200 + filtradas |
| TC-05-14 | GET Sin Token | GET /api/reservas | 403 Forbidden |
| TC-05-15 | POST Sin Token | POST /api/reservas | 403 Forbidden |

### HU-06: Pagos + Dashboard

| TC-ID | Nombre | Endpoint | Esperado |
|---|---|---|---|
| TC-06-01 | Login Admin | POST /api/auth/login | 200 + token admin |
| TC-06-02 | Crear Pago Básico | POST /api/pagos | 201 |
| TC-06-03 | Crear Pago Con Mora y Daños | POST /api/pagos | 201 |
| TC-06-04 | Listar Todos Los Pagos | GET /api/pagos | 200 + lista |
| TC-06-05 | Obtener Pago Por ID | GET /api/pagos/{id} | 200 + pago |
| TC-06-06 | Pagos Por Reserva Query Param | GET /api/pagos?reservaId=... | 200 + lista |
| TC-06-07 | Pagos Por Reserva Path | GET /api/pagos/reserva/{id} | 200 + lista |
| TC-06-08 | Dashboard Stats | GET /api/dashboard/stats | 200 + estadísticas |
| TC-06-09 | Dashboard Reservas Hoy | GET /api/dashboard/reservas-hoy | 200 + lista |
| TC-06-10 | Dashboard Vehículos Mantto | GET /api/dashboard/vehiculos-mantenimiento | 200 + lista |
| TC-06-11 | Dashboard Ingresos Mensuales | GET /api/dashboard/ingresos-mensuales | 200 + datos |
| TC-06-12 | Crear Pago Sin Token | POST /api/pagos | 403 Forbidden |
| TC-06-13 | Crear Pago Reserva Inexistente | POST /api/pagos | 404 Not Found |
| TC-06-14 | GET Pagos Sin Token | GET /api/pagos | 403 Forbidden |
| TC-06-15 | Dashboard Sin Token | GET /api/dashboard/stats | 403 Forbidden |

### HU-07: Reparaciones + Mantenimientos + Configuración

| TC-ID | Nombre | Endpoint | Esperado |
|---|---|---|---|
| TC-07-01 | Login Admin | POST /api/auth/login | 200 + token admin |
| TC-07-02 | Crear Reparación | POST /api/reparaciones | 201 |
| TC-07-03 | Responsable Inválido | POST /api/reparaciones | 400 Bad Request |
| TC-07-04 | Cambiar Estado En Proceso | PUT /api/reparaciones/{id}/estado | 200 |
| TC-07-05 | Cambiar Estado Completada | PUT /api/reparaciones/{id}/estado | 200 |
| TC-07-06 | Filtrar Por Estado | GET /api/reparaciones?estado=... | 200 + filtradas |
| TC-07-07 | Catálogo Reparaciones | GET /api/catalogo-reparaciones | 200 + lista |
| TC-07-08 | Crear Mantenimiento | POST /api/mantenimientos | 201 |
| TC-07-09 | Tipo Mantenimiento Inválido | POST /api/mantenimientos | 400 Bad Request |
| TC-07-10 | Mantenimientos En Curso | GET /api/mantenimientos/en-curso | 200 + lista |
| TC-07-11 | Finalizar Mantenimiento | PUT /api/mantenimientos/{id}/finalizar | 200 |
| TC-07-12 | Crear Configuración | POST /api/configuraciones | 201 |
| TC-07-13 | Configuración Clave Duplicada | POST /api/configuraciones | 409 Conflict |
| TC-07-14 | Configuración Tipo Inválido | POST /api/configuraciones | 400 Bad Request |
| TC-07-15 | Eliminar Configuración | DELETE /api/configuraciones/{id} | 200 |
| TC-07-16 | GET Sin Token | GET /api/reparaciones | 403 Forbidden |

### HU-08: Registro Cliente + Role Routing

| TC-ID | Nombre | Endpoint | Esperado |
|---|---|---|---|
| TC-08-01 | Registro Exitoso | POST /api/auth/register | 201 + token JWT |
| TC-08-02 | Login Con Credenciales Registradas | POST /api/auth/login | 200 + token |
| TC-08-03 | Registro Email Duplicado | POST /api/auth/register | 409 Conflict |
| TC-08-04 | Registro DNI Duplicado | POST /api/auth/register | 409 Conflict |
| TC-08-05 | Registro Clave Corta | POST /api/auth/register | 400 Bad Request |
| TC-08-06 | Registro Sin Licencia | POST /api/auth/register | 400 Bad Request |
| TC-08-07 | Registro Sin Email | POST /api/auth/register | 400 Bad Request |
| TC-08-08 | Registro Sin DNI | POST /api/auth/register | 400 Bad Request |

### HU-09: Portal Ecommerce Backend

| TC-ID | Nombre | Endpoint | Esperado |
|---|---|---|---|
| TC-09-01 | Registrar Cliente | POST /api/auth/register | 201 + token |
| TC-09-02 | GET Perfil Me | GET /api/clientes/me | 200 + perfil |
| TC-09-03 | PUT Actualizar Perfil | PUT /api/clientes/me | 200 + actualizado |
| TC-09-04 | GET Auto Por ID (público) | GET /api/autos/{id} | 200 + auto |
| TC-09-05 | POST Reserva Desde Portal | POST /api/reservas | 201 |
| TC-09-06 | GET Mis Reservas | GET /api/reservas/mis-reservas | 200 + lista |
| TC-09-07 | Cambiar Clave Correcta | PATCH /api/clientes/me/cambiar-clave | 200 |
| TC-09-08 | Cambiar Clave Incorrecta | PATCH /api/clientes/me/cambiar-clave | 400 Bad Request |
| TC-09-09 | Cancelar Reserva Propia | PUT /api/reservas/{id}/cancelar | 200 |

---

## 4. Pruebas Unitarias

| TC-ID | Clase | Tipo | Esperado |
|---|---|---|---|
| TC-U-01 | AlquilerautoApplicationTests | Carga de contexto Spring | Contexto carga sin errores |

---

## 5. Resultados Globales

| Indicador | Valor |
|---|---|
| Total casos de prueba | 102 (101 integración + 1 unitaria) |
| Casos happy path | 48 |
| Casos de error | 29 |
| Casos de seguridad JWT | 24 |
| Historias de Usuario cubiertas | 9 / 9 |
| Ejecución | Exitosa |
| Errores encontrados y corregidos | Ver issues [#94](https://github.com/DaikoDk/DRIVO/issues/94), [#97](https://github.com/DaikoDk/DRIVO/issues/97), [#104](https://github.com/DaikoDk/DRIVO/issues/104), [#106](https://github.com/DaikoDk/DRIVO/issues/106) |

---

## 6. Evidencia

Las colecciones de pruebas se encuentran en el directorio `bruno/` del repositorio, organizadas por Historia de Usuario:

```
bruno/
├── HU-01/ (6 pruebas)
├── HU-02/ (11 pruebas)
├── HU-03/ (11 pruebas)
├── HU-04/ (10 pruebas)
├── HU-05/ (15 pruebas)
├── HU-06/ (15 pruebas)
├── HU-07/ (16 pruebas)
├── HU-08/ (8 pruebas)
└── HU-09/ (9 pruebas)
```

Cada archivo `.bru` contiene la definición completa de la prueba: método HTTP, endpoint, headers (incluyendo token JWT donde aplica), body de la solicitud y aserciones de respuesta.
