# Cronograma de Hitos — DRIVO Rent-a-Car

## Metodología

Se aplicó **Scrum** con iteraciones cortas. Cada Historia de Usuario (HU) constituye un hito del proyecto, desarrollado en orden de prioridad (P0 → P1 → P2). Las HU se gestionaron como **GitHub Issues**, cada una con sub-tareas, asignación a un desarrollador responsable y un Pull Request vinculado con revisión de código.

---

## Hitos del Proyecto

| # | Hito | Historia de Usuario | SP | Prioridad | Asignado | Sub-tareas | PR | Estado |
|---|---|---|---|---|---|---|---|---|
| H-01 | Seguridad base | HU-01: Security + JWT + Login | 8 | P0 | DaikoDk | 5/5 | [#76](https://github.com/DaikoDk/DRIVO/pull/76) | Done |
| H-02 | Catálogo base | HU-02: Marcas + Modelos | 5 | P0 | edgaradrianmora | 8/8 | [#77](https://github.com/DaikoDk/DRIVO/pull/77) | Done |
| H-03 | Flota de autos | HU-03: Vehículos - Autos | 5 | P0 | DaikoDk | 5/5 | [#78](https://github.com/DaikoDk/DRIVO/pull/78) | Done |
| H-04 | Clientes | HU-04: Clientes + Licencias | 5 | P0 | Stronghold321 | 6/6 | [#79](https://github.com/DaikoDk/DRIVO/pull/79) | Done |
| H-05 | Alquiler core | HU-05: Reservas | 8 | P0 | DaikoDk | 8/8 | [#81](https://github.com/DaikoDk/DRIVO/pull/81) | Done |
| H-06 | Reportes | HU-06: Pagos + Dashboard | 6 | P1 | edgaradrianmora | 7/7 | [#96](https://github.com/DaikoDk/DRIVO/pull/96) | Done |
| H-07 | Taller y config | HU-07: Reparaciones + Mantenimientos | 6 | P0 | Stronghold321 | 8/8 | [#82](https://github.com/DaikoDk/DRIVO/pull/82) | Done |
| H-08 | Auto-registro | HU-08: Registro Cliente | 5 | P0 | Stronghold321 | 6/6 | [#84](https://github.com/DaikoDk/DRIVO/pull/84) | Done |
| H-09 | Portal cliente | HU-09: Portal Ecommerce | 8 | P0 | DaikoDk | 7/7 | [#85](https://github.com/DaikoDk/DRIVO/pull/85) | Done |
| H-10 | Chatbot IA | HU-10: Watson Assistant | 5 | P2 | DaikoDk | 6/6 | [#108](https://github.com/DaikoDk/DRIVO/pull/108) | Done |
| H-11 | Integración FE+BE | HU-11: Frontend-Backend Sync | 6 | — | — | 6/6 | [#93](https://github.com/DaikoDk/DRIVO/pull/93) | Done |
| H-12 | Flujo de pago | HU-12: Entrega y pago | — | — | — | 1/2 | [#120](https://github.com/DaikoDk/DRIVO/pull/120) | Done |

---

## Cronograma (Diagrama Gantt)

```
Semana 1  ████████  H-01: Security + JWT (8 SP)
Semana 2  ████████  H-02: Marcas + Modelos (5 SP)  +  H-03: Vehículos (5 SP)
Semana 3  ████████  H-04: Clientes (5 SP)  +  H-05: Reservas (8 SP)
Semana 4  ████████  H-06: Pagos + Dashboard (6 SP)  +  H-07: Reparaciones (6 SP)
Semana 5  ████████  H-08: Registro Cliente (5 SP)  +  H-09: Portal (8 SP)
Semana 6  ████████  H-10: Watson (5 SP)  +  H-11: Integración FE+BE (6 SP)
Semana 7  ████████  H-12: Flujo de pago  +  Refactors + UX/UI + Setup
```

---

## Equipo y Responsabilidades

| Desarrollador | Rol | HUs asignadas |
|---|---|---|
| DaikoDk | Coordinador / Backend Lead | HU-01, HU-03, HU-05, HU-09, HU-10 |
| edgaradrianmora | Backend Developer | HU-02, HU-06 |
| Stronghold321 | Backend Developer | HU-04, HU-07, HU-08 |

---

## Métricas Finales

| Indicador | Valor |
|---|---|
| Total Story Points | 61+ |
| Hitos completados | 12 / 12 |
| Tasa de completitud | 100% |
| PRs mergeados | 12+ |
| Tests de integración | 101 casos (Bruno) |
