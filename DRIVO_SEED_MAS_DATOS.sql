-- ============================================================
--  SEED: DATOS ADICIONALES PARA PRUEBAS
--  Escenarios: fechas pasadas, vigentes y futuras;
--  reservas en todos los estados; autos variados.
--  Ejecutar DESPUES de DRIVO_BD.sql (usa IDs existentes).
-- ============================================================
USE BD_RentCar;
GO

-- ============================================================
--  1. MARCAS Y MODELOS ADICIONALES
-- ============================================================
SET IDENTITY_INSERT tb_marca ON;
INSERT INTO tb_marca (idMarca, nombre, paisOrigen) VALUES
(4, 'Nissan',   'Japon'),
(5, 'Mazda',    'Japon'),
(6, 'Suzuki',   'Japon'),
(7, 'Chevrolet','EE.UU.');
SET IDENTITY_INSERT tb_marca OFF;
GO

SET IDENTITY_INSERT tb_modelo ON;
INSERT INTO tb_modelo (idModelo, idMarca, nombre, categoria, numeroPasajeros) VALUES
(4,  1, 'Corolla',    'Sedan',      5),
(5,  1, 'RAV4',       'SUV',        5),
(6,  1, 'Hilux',      'Pickup',     5),
(7,  2, 'Tucson',     'SUV',        5),
(8,  2, 'Creta',      'SUV',        5),
(9,  3, 'Sportage',   'SUV',        5),
(10, 3, 'Seltos',     'SUV',        5),
(11, 4, 'Sentra',     'Sedan',      5),
(12, 4, 'Versa',      'Sedan',      5),
(13, 4, 'Kicks',      'SUV',        5),
(14, 5, 'Mazda3',     'Sedan',      5),
(15, 5, 'CX-5',       'SUV',        5),
(16, 6, 'Swift',      'Hatchback',  5),
(17, 6, 'Vitara',     'SUV',        5),
(18, 7, 'Onix',       'Sedan',      5),
(19, 7, 'Tracker',    'SUV',        5);
SET IDENTITY_INSERT tb_modelo OFF;
GO

-- ============================================================
--  2. AUTOS ADICIONALES (7 nuevos, total 10)
-- ============================================================
SET IDENTITY_INSERT tb_auto ON;
INSERT INTO tb_auto (idAuto, placa, idMarca, idModelo, anio, color, kilometrajeActual, ultimaRevisionKm, proximaRevisionKm, precioPorDia, precioPorHora, moraPorDia, estado, fotoUrl) VALUES
-- Disponibles (varios precios para probar filtros)
(4,  'JKL-012', 4, 11, 2022, 'Gris',     22500, 20000, 30000, 150.00, 18.00, 35.00, 'Disponible',  NULL),
(5,  'MNO-345', 5, 14, 2023, 'Azul',     12500, 10000, 20000, 180.00, 22.00, 40.00, 'Disponible',  NULL),
(6,  'PQR-678', 6, 16, 2022, 'Blanco',   32100, 30000, 40000,  95.00, 12.00, 20.00, 'Disponible',  NULL),
(7,  'STU-901', 7, 18, 2024, 'Negro',     8500,  5000, 15000, 140.00, 17.00, 30.00, 'Disponible',  NULL),
-- Reservado (tiene reserva futura)
(8,  'VWX-234', 2,  7, 2021, 'Plateado', 41000, 35000, 45000, 160.00, 20.00, 35.00, 'Reservado',   NULL),
-- En proceso (rentado actualmente)
(9,  'YZA-567', 3,  9, 2023, 'Rojo',     18900, 15000, 25000, 170.00, 21.00, 40.00, 'En proceso',  NULL),
-- En reparacion
(10, 'BCD-890', 1,  6, 2020, 'Blanco',   62300, 58000, 65000, 200.00, 25.00, 50.00, 'En reparaci'+CHAR(243)+'n', NULL);
SET IDENTITY_INSERT tb_auto OFF;
GO

-- ============================================================
--  3. LICENCIAS ADICIONALES (4)
-- ============================================================
SET IDENTITY_INSERT tb_licencia ON;
INSERT INTO tb_licencia (idLicencia, numeroLicencia, categoria, fechaVencimiento) VALUES
(4, 'Q99887766', 'A-IIb', '2028-07-01'),
(5, 'Q55443322', 'A-IIIa','2027-11-15'),
(6, 'Q66778899', 'A-I',   '2029-02-28'),
(7, 'Q44332211', 'A-IIa', '2026-09-10');
SET IDENTITY_INSERT tb_licencia OFF;
GO

-- ============================================================
--  4. CLIENTES ADICIONALES (4, total 7)
-- ============================================================
SET IDENTITY_INSERT tb_cliente ON;
INSERT INTO tb_cliente (idCliente, nombre, apellidoPaterno, apellidoMaterno, dni, telefono, email, direccion, idLicencia, numeroReservas, estado) VALUES
(4, 'Ana',     'Ramirez', 'Torres',  '33445566', '977881122', 'ana.ramirez@example.com',  'Av. Primavera 789, Surco',      4, 0, 'activo'),
(5, 'Pedro',   'Sulca',   'Vega',    '99887766', '966554433', 'pedro.sulca@example.com',  'Jr. Los Sauces 321, Miraflores',5, 0, 'activo'),
(6, 'Lucia',   'Mendoza', 'Paredes', '77665544', '955667788', 'lucia.mendoza@example.com', 'Calle Las Flores 654, San Isidro',6, 0, 'activo'),
(7, 'Roberto', 'Castro',  NULL,      '55667788', '944332211', 'roberto.castro@example.com','Av. Industrial 987, Callao',    7, 0, 'activo');
SET IDENTITY_INSERT tb_cliente OFF;
GO

-- ============================================================
--  5. RESERVAS ADICIONALES (11, total 14)
--  Situaciones que se prueban:
--    Pendiente  | fecha futura (no ha iniciado)
--    Confirmada | hizo check-in, espera recoger
--    Cancelada  | cancelada por admin/cliente
--    Expirada   | no hizo check-in a tiempo
--    En curso   | activa hoy
--    En demora  | debio devolver ayer
--    Entregado  | devuelto, falta pago
--    Finalizado | pagado y cerrado (varios meses)
-- ============================================================
DECLARE @estadoPendiente  INT;
DECLARE @estadoConfirmada INT;
DECLARE @estadoCancelada  INT;
DECLARE @estadoExpirada   INT;
DECLARE @estadoEnCurso    INT;
DECLARE @estadoEnDemora   INT;
DECLARE @estadoEntregado  INT;
DECLARE @estadoFinalizado INT;
SELECT @estadoPendiente  = id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'RESERVA_PENDIENTE';
SELECT @estadoConfirmada = id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'RESERVA_CONFIRMADA';
SELECT @estadoCancelada  = id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'RESERVA_CANCELADA';
SELECT @estadoExpirada   = id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'RESERVA_EXPIRADA';
SELECT @estadoEnCurso    = id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_EN_CURSO';
SELECT @estadoEnDemora   = id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_EN_DEMORA';
SELECT @estadoEntregado  = id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_ENTREGADO';
SELECT @estadoFinalizado = id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_FINALIZADO';

SET IDENTITY_INSERT tb_reserva ON;
INSERT INTO tb_reserva (idReserva, idCliente, idAuto, id_estado, fechaInicio, horaInicio, fechaFin, horaFin, kilometrajeInicio, subtotal, total, estadoEntrega, fechaCreacion, usuarioCreacion, fechaHoraInicioReal, fechaFinalizacion, usuarioFinalizacion) VALUES

-- (4) Pendiente: cliente nuevo, auto disponible, futuro (Julio)
(4, 4, 4, @estadoPendiente, '2026-07-10', '09:00', '2026-07-14', '18:00', NULL, 600.00, 600.00, 'Sin entregar', '2026-06-18 15:30:00', 'admin', NULL, NULL, NULL),

-- (5) Pendiente: cliente nuevo, auto disponible, futuro (Agosto)
(5, 5, 6, @estadoPendiente, '2026-08-05', '08:00', '2026-08-08', '20:00', NULL, 285.00, 285.00, 'Sin entregar', '2026-06-19 10:00:00', 'admin', NULL, NULL, NULL),

-- (6) Confirmada: cliente hizo check-in, espera recoger manana
(6, 6, 7, @estadoConfirmada, '2026-06-20', '14:00', '2026-06-22', '12:00', NULL, 420.00, 420.00, 'Sin entregar', '2026-06-18 08:00:00', 'admin', NULL, NULL, NULL),

-- (7) Cancelada: cliente desistio
(7, 3, 3, @estadoCancelada, '2026-06-01', '10:00', '2026-06-03', '18:00', NULL, 260.00, 260.00, 'Sin entregar', '2026-05-25 11:00:00', 'admin', NULL, NULL, NULL),

-- (8) Expirada: no se presento al check-in
(8, 4, 5, @estadoExpirada, '2026-06-10', '09:00', '2026-06-12', '18:00', NULL, 360.00, 360.00, 'Sin entregar', '2026-06-05 09:00:00', 'admin', NULL, NULL, NULL),

-- (9) En curso: activo hoy (auto #9)
(9, 2, 9, @estadoEnCurso, '2026-06-17', '10:00', '2026-06-21', '12:00', 18500, 680.00, 680.00, 'Sin entregar', '2026-06-15 14:00:00', 'admin', '2026-06-17 10:00:00', NULL, NULL),

-- (10) En demora: debio devolver ayer y no lo hizo (auto #2 ya estaba en proceso en seed original, usamos auto #8)
(10, 5, 8, @estadoEnDemora, '2026-06-14', '08:00', '2026-06-18', '20:00', 40500, 800.00, 880.00, 'Entregado con retraso', '2026-06-12 09:00:00', 'admin', '2026-06-14 08:00:00', NULL, NULL),

-- (11) Entregado: devolvio, pendiente de pago
(11, 6, 1, @estadoEntregado, '2026-06-12', '09:00', '2026-06-15', '18:00', 45800, 450.00, 500.00, 'Entregado con da'+CHAR(241)+'os', '2026-06-10 10:00:00', 'admin', '2026-06-12 09:00:00', NULL, NULL),

-- (12) Finalizado: cerrado hace 2 semanas
(12, 7, 4, @estadoFinalizado, '2026-05-25', '09:00', '2026-05-27', '18:00', 22000, 450.00, 450.00, 'Entregado OK', '2026-05-22 16:00:00', 'admin', '2026-05-25 09:00:00', '2026-05-27 17:30:00', 'admin'),

-- (13) Finalizado: cerrado hace 1 mes
(13, 1, 5, @estadoFinalizado, '2026-05-01', '08:00', '2026-05-04', '20:00', 12000, 720.00, 820.00, 'Entregado con da'+CHAR(241)+'os', '2026-04-28 11:00:00', 'admin', '2026-05-01 08:00:00', '2026-05-04 19:00:00', 'admin'),

-- (14) Finalizado: cerrado hace 2 meses
(14, 3, 6, @estadoFinalizado, '2026-04-10', '10:00', '2026-04-13', '16:00', 30000, 285.00, 285.00, 'Entregado OK', '2026-04-07 09:00:00', 'admin', '2026-04-10 10:00:00', '2026-04-13 15:00:00', 'admin');
SET IDENTITY_INSERT tb_reserva OFF;
GO

-- Actualizar kilometrajeFin de las que ya terminaron
UPDATE tb_reserva SET kilometrajeFin = 46200, fechaHoraFinReal = '2026-06-15 17:45:00', observacionesEntrega = 'Espejo retrovisor izquierdo roto' WHERE idReserva = 11;
UPDATE tb_reserva SET kilometrajeFin = 22300, fechaHoraFinReal = '2026-05-27 17:30:00' WHERE idReserva = 12;
UPDATE tb_reserva SET kilometrajeFin = 12500, fechaHoraFinReal = '2026-05-04 19:00:00', costoReparaciones = 100.00, observacionesEntrega = 'Llantas delanteras desgastadas' WHERE idReserva = 13;
UPDATE tb_reserva SET kilometrajeFin = 30500, fechaHoraFinReal = '2026-04-13 15:00:00' WHERE idReserva = 14;
GO

-- Actualizar kilometraje de autos segun reservas finalizadas
UPDATE tb_auto SET kilometrajeActual = 46200 WHERE idAuto = 1;
UPDATE tb_auto SET kilometrajeActual = 22300 WHERE idAuto = 4;
UPDATE tb_auto SET kilometrajeActual = 12500 WHERE idAuto = 5;
UPDATE tb_auto SET kilometrajeActual = 30500 WHERE idAuto = 6;
GO

-- ============================================================
--  6. PAGOS ADICIONALES (3, total 5)
-- ============================================================
SET IDENTITY_INSERT tb_pago ON;
INSERT INTO tb_pago (idPago, idReserva, montoBase, montoMora, montoDanos, montoTotalPagado, fechaPago, metodoPago) VALUES
(3, 12, 450.00, 0,     0,      450.00, '2026-05-27 17:45:00', 'Transferencia'),
(4, 13, 720.00, 0,   100.00,   820.00, '2026-05-04 19:30:00', 'Tarjeta'),
(5, 14, 285.00, 0,     0,      285.00, '2026-04-13 15:30:00', 'Efectivo');
SET IDENTITY_INSERT tb_pago OFF;
GO

-- ============================================================
--  7. REPARACIONES ADICIONALES (2, total 3)
-- ============================================================
SET IDENTITY_INSERT tb_reparacion ON;
INSERT INTO tb_reparacion (idReparacion, idReserva, idAuto, idCatalogoReparacion, descripcion, costo, estado, responsable, fechaReporte, usuarioReporte) VALUES
(2, 11, 1, 3, 'Espejo retrovisor izquierdo roto', 50.00, 'Pendiente', 'Cliente', '2026-06-15 18:00:00', 'admin'),
(3, 13, 5, 2, 'Llantas delanteras desgastadas', 100.00, 'Pendiente', 'Cliente', '2026-05-04 19:30:00', 'admin');
SET IDENTITY_INSERT tb_reparacion OFF;
GO

-- ============================================================
--  8. MANTENIMIENTOS ADICIONALES (2, total 4)
-- ============================================================
INSERT INTO tb_mantenimiento (idAuto, fechaIngreso, fechaSalida, tipo, costo, detalle) VALUES
(10, '2026-06-17', NULL, 'Correctivo', 800.00, 'Revision de transmision + embrague'),
(8,  '2026-05-20', '2026-05-21', 'Preventivo', 180.00, 'Alineamiento y balanceo + cambio de aceite');
GO

-- ============================================================
--  9. HISTORIAL DE KILOMETRAJE (4 registros mas, total 7)
-- ============================================================
INSERT INTO tb_historial_kilometraje (idAuto, idReserva, kilometrajeAnterior, kilometrajeNuevo, tipoRegistro, usuarioRegistro) VALUES
(9,  9, 18500, 18900, 'Reserva', 'admin'),
(8, 10, 40500, 41000, 'Reserva', 'admin'),
(1, 11, 45800, 46200, 'Reserva', 'admin'),
(4, 12, 22000, 22300, 'Reserva', 'admin'),
(5, 13, 12000, 12500, 'Reserva', 'admin'),
(6, 14, 30000, 30500, 'Reserva', 'admin');
GO

-- ============================================================
--  10. ACTUALIZAR numeroReservas EN CLIENTES
-- ============================================================
UPDATE tb_cliente SET numeroReservas = 2 WHERE idCliente = 1; -- Juan: ahora 2 reservas
UPDATE tb_cliente SET numeroReservas = 2 WHERE idCliente = 2; -- Maria: 2
UPDATE tb_cliente SET numeroReservas = 3 WHERE idCliente = 3; -- Carlos: tiene 3 (incluye cancelada)
UPDATE tb_cliente SET numeroReservas = 1 WHERE idCliente = 4; -- Ana: 1 expirada + 1 pendiente
UPDATE tb_cliente SET numeroReservas = 1 WHERE idCliente = 5; -- Pedro: 1 pendiente + 1 en demora
UPDATE tb_cliente SET numeroReservas = 1 WHERE idCliente = 6; -- Lucia: 1 confirmada + 1 entregado
GO

-- ============================================================
--  VERIFICACION
-- ============================================================
DECLARE @cntAuto INT, @cntCli INT, @cntRes INT, @cntPag INT, @cntRep INT, @cntMant INT;
SELECT @cntAuto = COUNT(*) FROM tb_auto;
SELECT @cntCli  = COUNT(*) FROM tb_cliente;
SELECT @cntRes  = COUNT(*) FROM tb_reserva;
SELECT @cntPag  = COUNT(*) FROM tb_pago;
SELECT @cntRep  = COUNT(*) FROM tb_reparacion;
SELECT @cntMant = COUNT(*) FROM tb_mantenimiento;
PRINT '--- RESUMEN ---';
PRINT 'Autos:       ' + CAST(@cntAuto AS VARCHAR) + ' (5 disponibles, 1 reservado, 2 en proceso, 2 en reparacion)';
PRINT 'Clientes:    ' + CAST(@cntCli AS VARCHAR);
PRINT 'Reservas:    ' + CAST(@cntRes AS VARCHAR) + ' (2 pendientes, 1 confirmada, 1 cancelada, 1 expirada, 2 en curso, 1 en demora, 1 entregada, 5 finalizadas)';
PRINT 'Pagos:       ' + CAST(@cntPag AS VARCHAR);
PRINT 'Reparaciones:' + CAST(@cntRep AS VARCHAR);
PRINT 'Mantenim.:   ' + CAST(@cntMant AS VARCHAR);
GO
