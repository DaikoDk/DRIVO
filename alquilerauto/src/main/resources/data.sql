-- ============================================================
--  SEED DATA PARA PERFIL H2 (bd_rentcar)
--  Hibernate crea las tablas con ddl-auto: update
--  Luego Spring ejecuta este script via spring.sql.init
-- ============================================================

-- 1. Estados (catalogo)
INSERT INTO tb_estado (entidad, codigo, nombre, descripcion, orden) VALUES
('RESERVA', 'RESERVA_PENDIENTE',   'Pendiente',   'Reserva creada, esperando check-in del cliente',       1),
('RESERVA', 'RESERVA_CONFIRMADA',  'Confirmada',  'Cliente hizo check-in, esperando fecha de inicio',      2),
('RESERVA', 'RESERVA_CANCELADA',   'Cancelada',   'Cancelada manualmente por cliente o admin',             3),
('RESERVA', 'RESERVA_EXPIRADA',    'Expirada',    'Check-in no realizado dentro del plazo',                 4),
('RESERVA', 'ALQUILER_EN_CURSO',   'En curso',    'Alquiler activo, auto en posesion del cliente',          5),
('RESERVA', 'ALQUILER_EN_DEMORA',  'En demora',   'Cliente no ha devuelto el auto pasado el tiempo limite', 6),
('RESERVA', 'ALQUILER_ENTREGADO',  'Entregado',   'Auto devuelto por el cliente',                          7),
('RESERVA', 'ALQUILER_FINALIZADO', 'Finalizado',  'Pago procesado, reserva completada',                    8),
('AUTO',    'DISPONIBLE',          'Disponible',  'Listo para alquilar',                                   1),
('AUTO',    'RESERVADO',           'Reservado',   'Bloqueado por una reserva futura',                       2),
('AUTO',    'EN_PROCESO',          'En proceso',  'Actual mente alquilado',                                 3),
('AUTO',    'EN_REPARACION',       'En reparacion','En taller',                                             4),
('CLIENTE', 'ACTIVO',              'Activo',      'Cliente habilitado para alquilar',                       1),
('CLIENTE', 'INACTIVO',            'Inactivo',    'Cliente deshabilitado',                                  2),
('REPARACION', 'PENDIENTE',        'Pendiente',   'Reparacion registrada, sin iniciar',                     1),
('REPARACION', 'EN_PROCESO',       'En proceso',  'Reparacion en taller',                                   2),
('REPARACION', 'COMPLETADA',       'Completada',  'Reparacion finalizada',                                  3),
('REPARACION', 'CANCELADA',        'Cancelada',   'Reparacion cancelada',                                   4);

-- 2. Marcas
INSERT INTO tb_marca (nombre, paisOrigen) VALUES
('Toyota', 'Japon'),
('Hyundai', 'Corea del Sur'),
('Kia', 'Corea del Sur');

-- 3. Modelos
INSERT INTO tb_modelo (idMarca, nombre, categoria, numeroPasajeros)
SELECT m.idMarca, 'Yaris', 'Sedan', 5 FROM tb_marca m WHERE m.nombre = 'Toyota';
INSERT INTO tb_modelo (idMarca, nombre, categoria, numeroPasajeros)
SELECT m.idMarca, 'Accent', 'Sedan', 5 FROM tb_marca m WHERE m.nombre = 'Hyundai';
INSERT INTO tb_modelo (idMarca, nombre, categoria, numeroPasajeros)
SELECT m.idMarca, 'Rio', 'Hatchback', 5 FROM tb_marca m WHERE m.nombre = 'Kia';

-- 4. Autos
INSERT INTO tb_auto (placa, idMarca, idModelo, anio, color, kilometrajeActual, ultimaRevisionKm, proximaRevisionKm, precioPorDia, precioPorHora, moraPorDia, estado)
SELECT 'ABC-123', m.idMarca, mo.idModelo, 2020, 'Blanco', 45500, 40000, 50000, 120.00, 15.00, 30.00, 'Disponible'
FROM tb_marca m, tb_modelo mo WHERE m.nombre = 'Toyota' AND mo.nombre = 'Yaris';

INSERT INTO tb_auto (placa, idMarca, idModelo, anio, color, kilometrajeActual, ultimaRevisionKm, proximaRevisionKm, precioPorDia, precioPorHora, moraPorDia, estado)
SELECT 'DEF-456', m.idMarca, mo.idModelo, 2019, 'Negro', 52300, 48000, 58000, 110.00, 13.00, 25.00, 'En proceso'
FROM tb_marca m, tb_modelo mo WHERE m.nombre = 'Hyundai' AND mo.nombre = 'Accent';

INSERT INTO tb_auto (placa, idMarca, idModelo, anio, color, kilometrajeActual, ultimaRevisionKm, proximaRevisionKm, precioPorDia, precioPorHora, moraPorDia, estado)
SELECT 'GHI-789', m.idMarca, mo.idModelo, 2021, 'Rojo', 38000, 35000, 40000, 130.00, 16.00, 30.00, 'En reparacion'
FROM tb_marca m, tb_modelo mo WHERE m.nombre = 'Kia' AND mo.nombre = 'Rio';

-- 5. Licencias
INSERT INTO tb_licencia (numeroLicencia, categoria, fechaVencimiento) VALUES
('Q12345678', 'A-IIa', '2027-06-15'),
('Q87654321', 'A-IIa', '2027-12-20'),
('Q11223344', 'A-I',   '2028-03-10');

-- 6. Usuarios
INSERT INTO tb_usuario (Nombre, Correo, Clave, Rol) VALUES
('Admin DRIVO',  'admin@drivo.com',  '$2a$10$txCV75IDyzhVolXP1WiHxO8yKJz578AtDfaEbTRPLww3RfvIf3D9y', 'ADMIN'),
('Carlos Lopez', 'carlos@email.com', '$2a$10$GJKccfi4IMsR1n.Qkim30eLsBURpVGBdo3dsxqs9YxUIhBmgJU/hi', 'CLIENTE');

-- 7. Clientes
INSERT INTO tb_cliente (nombre, apellidoPaterno, apellidoMaterno, dni, telefono, email, direccion, idLicencia, numeroReservas, estado)
SELECT 'Juan', 'Perez', 'Garcia', '12345678', '987654321', 'juanperez@example.com', 'Av. Los Olivos 123, Lima', l.idLicencia, 1, 'activo'
FROM tb_licencia l WHERE l.numeroLicencia = 'Q12345678';

INSERT INTO tb_cliente (nombre, apellidoPaterno, apellidoMaterno, dni, telefono, email, direccion, idLicencia, numeroReservas, estado)
SELECT 'Maria', 'Lopez', 'Flores', '87654321', '912345678', 'marialopez@example.com', 'Jr. Las Palmeras 456, Lima', l.idLicencia, 1, 'activo'
FROM tb_licencia l WHERE l.numeroLicencia = 'Q87654321';

INSERT INTO tb_cliente (nombre, apellidoPaterno, apellidoMaterno, dni, telefono, email, direccion, idLicencia, numeroReservas, estado)
SELECT 'Carlos', 'Gomez', 'Rios', '11223344', '999555444', 'carlosgomez@example.com', 'Calle Real 789, Callao', l.idLicencia, 1, 'activo'
FROM tb_licencia l WHERE l.numeroLicencia = 'Q11223344';

-- 8. Reservas
INSERT INTO tb_reserva (idCliente, idAuto, id_estado, fechaInicio, horaInicio, fechaFin, horaFin, kilometrajeInicio, subtotal, total, estadoEntrega, fechaCreacion, usuarioCreacion, fechaHoraInicioReal, fechaFinalizacion, usuarioFinalizacion)
SELECT c.idCliente, a.idAuto, e.id_estado, '2026-05-10', '09:00', '2026-05-12', '18:00', 45000, 360.00, 360.00, 'Entregado OK', '2026-05-08 10:30:00', 'admin', '2026-05-10 09:00:00', '2026-05-12 17:45:00', 'admin'
FROM tb_cliente c, tb_auto a, tb_estado e
WHERE c.email = 'marialopez@example.com' AND a.placa = 'ABC-123' AND e.codigo = 'ALQUILER_FINALIZADO';

INSERT INTO tb_reserva (idCliente, idAuto, id_estado, fechaInicio, horaInicio, fechaFin, horaFin, kilometrajeInicio, subtotal, total, estadoEntrega, fechaCreacion, usuarioCreacion, fechaHoraInicioReal, fechaFinalizacion, usuarioFinalizacion)
SELECT c.idCliente, a.idAuto, e.id_estado, '2026-05-20', '08:00', '2026-05-22', '20:00', 45500, 450.00, 520.00, 'Entregado con danos', '2026-05-18 14:00:00', 'admin', '2026-05-20 08:00:00', '2026-05-22 18:00:00', 'admin'
FROM tb_cliente c, tb_auto a, tb_estado e
WHERE c.email = 'carlosgomez@example.com' AND a.placa = 'ABC-123' AND e.codigo = 'ALQUILER_FINALIZADO';

INSERT INTO tb_reserva (idCliente, idAuto, id_estado, fechaInicio, horaInicio, fechaFin, horaFin, kilometrajeInicio, subtotal, total, estadoEntrega, fechaCreacion, usuarioCreacion, fechaHoraInicioReal)
SELECT c.idCliente, a.idAuto, e.id_estado, '2026-06-15', '10:00', '2026-06-20', '16:00', 52300, 660.00, 660.00, 'Sin entregar', '2026-06-14 09:00:00', 'admin', '2026-06-15 10:00:00'
FROM tb_cliente c, tb_auto a, tb_estado e
WHERE c.email = 'juanperez@example.com' AND a.placa = 'DEF-456' AND e.codigo = 'ALQUILER_EN_CURSO';

-- 9. Actualizar kilometrajeFin de reservas finalizadas
UPDATE tb_reserva SET kilometrajeFin = 45500, fechaHoraFinReal = '2026-05-12 17:45:00'
WHERE idReserva = (SELECT r.idReserva FROM tb_reserva r JOIN tb_cliente c ON r.idCliente = c.idCliente WHERE c.email = 'marialopez@example.com' AND r.fechaInicio = '2026-05-10');

UPDATE tb_reserva SET kilometrajeFin = 45800, fechaHoraFinReal = '2026-05-22 18:00:00', costoReparaciones = 70.00, observacionesEntrega = 'Rayon leve en puerta trasera'
WHERE idReserva = (SELECT r.idReserva FROM tb_reserva r JOIN tb_cliente c ON r.idCliente = c.idCliente WHERE c.email = 'carlosgomez@example.com' AND r.fechaInicio = '2026-05-20');

-- 10. Pagos
INSERT INTO tb_pago (idReserva, montoBase, montoMora, montoDanos, montoTotalPagado, fechaPago, metodoPago)
SELECT r.idReserva, 360.00, 0, 0, 360.00, '2026-05-12 17:50:00', 'Tarjeta'
FROM tb_reserva r JOIN tb_cliente c ON r.idCliente = c.idCliente
WHERE c.email = 'marialopez@example.com' AND r.fechaInicio = '2026-05-10';

INSERT INTO tb_pago (idReserva, montoBase, montoMora, montoDanos, montoTotalPagado, fechaPago, metodoPago)
SELECT r.idReserva, 450.00, 0, 70.00, 520.00, '2026-05-22 18:10:00', 'Efectivo'
FROM tb_reserva r JOIN tb_cliente c ON r.idCliente = c.idCliente
WHERE c.email = 'carlosgomez@example.com' AND r.fechaInicio = '2026-05-20';

-- 11. Catalogo de reparaciones
INSERT INTO tb_catalogo_reparacion (descripcion, costoEstimado, tiempoEstimadoHoras) VALUES
('Rayon de pintura', 200.00, 4),
('Abolladura de carroceria', 500.00, 8),
('Rotura de espejo lateral', 150.00, 2);

-- 12. Reparaciones
INSERT INTO tb_reparacion (idReserva, idAuto, idCatalogoReparacion, descripcion, costo, estado, responsable, fechaReporte, usuarioReporte)
SELECT r.idReserva, a.idAuto, cr.idCatalogoReparacion, 'Rayon leve en puerta trasera derecha', 70.00, 'Completada', 'Cliente', '2026-05-22 18:00:00', 'admin'
FROM tb_reserva r, tb_auto a, tb_catalogo_reparacion cr, tb_cliente c
WHERE r.idCliente = c.idCliente AND c.email = 'carlosgomez@example.com' AND r.fechaInicio = '2026-05-20' AND a.placa = 'ABC-123' AND cr.descripcion = 'Rayon de pintura';

-- 13. Mantenimientos
INSERT INTO tb_mantenimiento (idAuto, fechaIngreso, tipo, costo, detalle)
SELECT a.idAuto, '2026-06-10', 'Correctivo', 350.00, 'Cambio de pastillas de freno delanteras'
FROM tb_auto a WHERE a.placa = 'GHI-789';

INSERT INTO tb_mantenimiento (idAuto, fechaIngreso, fechaSalida, tipo, costo, detalle)
SELECT a.idAuto, '2026-04-01', '2026-04-01', 'Preventivo', 120.00, 'Cambio de aceite y filtros programado'
FROM tb_auto a WHERE a.placa = 'ABC-123';

-- 14. Historial de kilometraje
INSERT INTO tb_historial_kilometraje (idAuto, idReserva, kilometrajeAnterior, kilometrajeNuevo, tipoRegistro, usuarioRegistro)
SELECT a.idAuto, r.idReserva, 45000, 45500, 'Reserva', 'admin'
FROM tb_auto a, tb_reserva r, tb_cliente c
WHERE a.placa = 'ABC-123' AND r.idCliente = c.idCliente AND c.email = 'marialopez@example.com' AND r.fechaInicio = '2026-05-10';

INSERT INTO tb_historial_kilometraje (idAuto, idReserva, kilometrajeAnterior, kilometrajeNuevo, tipoRegistro, usuarioRegistro)
SELECT a.idAuto, r.idReserva, 45500, 45800, 'Reserva', 'admin'
FROM tb_auto a, tb_reserva r, tb_cliente c
WHERE a.placa = 'ABC-123' AND r.idCliente = c.idCliente AND c.email = 'carlosgomez@example.com' AND r.fechaInicio = '2026-05-20';

INSERT INTO tb_historial_kilometraje (idAuto, idReserva, kilometrajeAnterior, kilometrajeNuevo, tipoRegistro, usuarioRegistro)
SELECT a.idAuto, r.idReserva, 52300, 52300, 'Reserva', 'admin'
FROM tb_auto a, tb_reserva r, tb_cliente c
WHERE a.placa = 'DEF-456' AND r.idCliente = c.idCliente AND c.email = 'juanperez@example.com' AND r.fechaInicio = '2026-06-15';

-- 15. Configuraciones
INSERT INTO tb_configuracion (clave, valor, descripcion, tipo) VALUES
('MoraPorHora',         '10.00', 'Penalizacion por cada hora de retraso en la devolucion', 'decimal'),
('TiempoGraciaMinutos', '60',   'Minutos de tolerancia antes de aplicar mora',            'entero'),
('KmRevisionPreventiva','5000', 'Cada cuantos kilometros se recomienda mantenimiento preventivo', 'entero');

-- 16. Vincular cliente Carlos con su usuario
UPDATE tb_cliente SET idUsuario = (SELECT IdUsuario FROM tb_usuario WHERE Correo = 'carlos@email.com')
WHERE dni = '11223344';
