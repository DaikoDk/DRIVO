-- ============================================================
-- DRIVO Rent-a-Car - Script de Base de Datos
-- SQL Server
-- Incluye: 13 tablas + FK Cliente→Usuario + datos de prueba
-- ============================================================

-- ============================================================
-- CREACION DE TABLAS
-- ============================================================

CREATE TABLE tb_marca (
    idMarca INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    paisOrigen VARCHAR(50) NULL,
    activo BIT NOT NULL DEFAULT 1,
    fechaRegistro DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE tb_modelo (
    idModelo INT IDENTITY(1,1) PRIMARY KEY,
    idMarca INT NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    categoria VARCHAR(30) NULL,
    numeroPasajeros INT NOT NULL DEFAULT 5,
    activo BIT NOT NULL DEFAULT 1,
    fechaRegistro DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Modelo_Marca FOREIGN KEY (idMarca) REFERENCES tb_marca(idMarca)
);

CREATE TABLE tb_auto (
    idAuto INT IDENTITY(1,1) PRIMARY KEY,
    placa VARCHAR(10) NOT NULL,
    idMarca INT NOT NULL,
    idModelo INT NOT NULL,
    anio INT NOT NULL,
    color VARCHAR(30) NULL,
    numeroMotor VARCHAR(50) NULL,
    numeroChasis VARCHAR(50) NULL,
    kilometrajeActual INT NOT NULL DEFAULT 0,
    ultimaRevisionKm INT NULL,
    proximaRevisionKm INT NULL,
    precioPorDia DECIMAL(10,2) NOT NULL,
    precioPorHora DECIMAL(10,2) NULL,
    moraPorDia DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'Disponible',
    activo BIT NOT NULL DEFAULT 1,
    fechaRegistro DATETIME2 DEFAULT GETDATE(),
    fechaUltimaActualizacion DATETIME2 NULL,
    CONSTRAINT FK_Auto_Marca FOREIGN KEY (idMarca) REFERENCES tb_marca(idMarca),
    CONSTRAINT FK_Auto_Modelo FOREIGN KEY (idModelo) REFERENCES tb_modelo(idModelo)
);

CREATE TABLE tb_licencia (
    idLicencia INT IDENTITY(1,1) PRIMARY KEY,
    numeroLicencia VARCHAR(30) NOT NULL,
    categoria VARCHAR(10) NOT NULL,
    fechaVencimiento DATE NOT NULL
);

CREATE TABLE tb_usuario (
    IdUsuario INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Correo VARCHAR(100) NOT NULL,
    Clave VARCHAR(255) NOT NULL,
    Rol VARCHAR(30) NOT NULL,
    Activo BIT NOT NULL DEFAULT 1,
    FechaRegistro DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE tb_cliente (
    idCliente INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellidoPaterno VARCHAR(50) NOT NULL,
    apellidoMaterno VARCHAR(50) NULL,
    dni VARCHAR(15) NOT NULL,
    telefono VARCHAR(20) NULL,
    email VARCHAR(100) NOT NULL,
    direccion VARCHAR(200) NULL,
    idLicencia INT NULL,
    idUsuario INT NULL,
    numeroReservas INT NOT NULL DEFAULT 0,
    numeroIncidentes INT NOT NULL DEFAULT 0,
    bloqueado BIT NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    activo BIT NOT NULL DEFAULT 1,
    fechaRegistro DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Cliente_Licencia FOREIGN KEY (idLicencia) REFERENCES tb_licencia(idLicencia),
    CONSTRAINT FK_Cliente_Usuario FOREIGN KEY (idUsuario) REFERENCES tb_usuario(IdUsuario)
);

-- Unique index para idUsuario (permite multiples NULL = admins sin cliente)
CREATE UNIQUE NONCLUSTERED INDEX UQ_Cliente_Usuario 
    ON tb_cliente(idUsuario) 
    WHERE idUsuario IS NOT NULL;

CREATE TABLE tb_reserva (
    idReserva INT IDENTITY(1,1) PRIMARY KEY,
    idCliente INT NOT NULL,
    idAuto INT NOT NULL,
    fechaInicio DATE NOT NULL,
    horaInicio TIME NOT NULL,
    fechaFin DATE NOT NULL,
    horaFin TIME NOT NULL,
    kilometrajeInicio INT NULL,
    kilometrajeFin INT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    mora DECIMAL(10,2) NOT NULL DEFAULT 0,
    costoReparaciones DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    estadoEntrega VARCHAR(30) NOT NULL DEFAULT 'Sin entregar',
    observacionesEntrega VARCHAR(500) NULL,
    fechaHoraInicioReal DATETIME2 NULL,
    fechaHoraFinReal DATETIME2 NULL,
    fechaCreacion DATETIME2 DEFAULT GETDATE(),
    usuarioCreacion VARCHAR(100) NULL,
    fechaFinalizacion DATETIME2 NULL,
    usuarioFinalizacion VARCHAR(100) NULL,
    CONSTRAINT FK_Reserva_Cliente FOREIGN KEY (idCliente) REFERENCES tb_cliente(idCliente),
    CONSTRAINT FK_Reserva_Auto FOREIGN KEY (idAuto) REFERENCES tb_auto(idAuto)
);

CREATE TABLE tb_pago (
    idPago INT IDENTITY(1,1) PRIMARY KEY,
    idReserva INT NOT NULL,
    montoBase DECIMAL(10,2) NOT NULL,
    montoMora DECIMAL(10,2) NOT NULL DEFAULT 0,
    montoDanos DECIMAL(10,2) NOT NULL DEFAULT 0,
    montoTotalPagado DECIMAL(10,2) NOT NULL,
    fechaPago DATETIME2 DEFAULT GETDATE(),
    metodoPago VARCHAR(30) NOT NULL,
    CONSTRAINT FK_Pago_Reserva FOREIGN KEY (idReserva) REFERENCES tb_reserva(idReserva)
);

CREATE TABLE tb_catalogo_reparacion (
    idCatalogoReparacion INT IDENTITY(1,1) PRIMARY KEY,
    descripcion VARCHAR(200) NOT NULL,
    costoEstimado DECIMAL(10,2) NOT NULL DEFAULT 0,
    tiempoEstimadoHoras INT NOT NULL DEFAULT 0,
    activo BIT NOT NULL DEFAULT 1,
    fechaRegistro DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE tb_reparacion (
    idReparacion INT IDENTITY(1,1) PRIMARY KEY,
    idReserva INT NOT NULL,
    idAuto INT NOT NULL,
    idCatalogoReparacion INT NULL,
    descripcion VARCHAR(500) NOT NULL,
    costo DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    responsable VARCHAR(30) NULL,
    fechaReporte DATETIME2 DEFAULT GETDATE(),
    fechaInicio DATETIME2 NULL,
    fechaFin DATETIME2 NULL,
    usuarioReporte VARCHAR(100) NULL,
    CONSTRAINT FK_Reparacion_Reserva FOREIGN KEY (idReserva) REFERENCES tb_reserva(idReserva),
    CONSTRAINT FK_Reparacion_Auto FOREIGN KEY (idAuto) REFERENCES tb_auto(idAuto),
    CONSTRAINT FK_Reparacion_Catalogo FOREIGN KEY (idCatalogoReparacion) REFERENCES tb_catalogo_reparacion(idCatalogoReparacion)
);

CREATE TABLE tb_mantenimiento (
    idMantenimiento INT IDENTITY(1,1) PRIMARY KEY,
    idAuto INT NOT NULL,
    fechaIngreso DATE NOT NULL,
    fechaSalida DATE NULL,
    tipo VARCHAR(20) NOT NULL,
    costo DECIMAL(10,2) NOT NULL DEFAULT 0,
    detalle VARCHAR(MAX) NULL,
    CONSTRAINT FK_Mantenimiento_Auto FOREIGN KEY (idAuto) REFERENCES tb_auto(idAuto)
);

CREATE TABLE tb_historial_kilometraje (
    idHistorial INT IDENTITY(1,1) PRIMARY KEY,
    idAuto INT NOT NULL,
    idReserva INT NULL,
    kilometrajeAnterior INT NOT NULL,
    kilometrajeNuevo INT NOT NULL,
    diferencia AS (kilometrajeNuevo - kilometrajeAnterior),
    tipoRegistro VARCHAR(30) NOT NULL DEFAULT 'Reserva',
    observaciones VARCHAR(300) NULL,
    fechaRegistro DATETIME2 DEFAULT GETDATE(),
    usuarioRegistro VARCHAR(100) NULL,
    CONSTRAINT FK_Historial_Auto FOREIGN KEY (idAuto) REFERENCES tb_auto(idAuto),
    CONSTRAINT FK_Historial_Reserva FOREIGN KEY (idReserva) REFERENCES tb_reserva(idReserva)
);

CREATE TABLE tb_configuracion (
    idConfiguracion INT IDENTITY(1,1) PRIMARY KEY,
    clave VARCHAR(50) NOT NULL,
    valor VARCHAR(200) NOT NULL,
    descripcion VARCHAR(300) NULL,
    tipo VARCHAR(20) NULL,
    fechaActualizacion DATETIME2 DEFAULT GETDATE()
);

-- ============================================================
-- DATOS DE PRUEBA
-- ============================================================

-- Usuarios (claves en texto plano solo para desarrollo)
-- En produccion usar BCrypt: $2a$10$...
INSERT INTO tb_usuario (Nombre, Correo, Clave, Rol) VALUES
('Admin DRIVO',   'admin@drivo.com',   'admin123',   'ADMIN'),
('Carlos Lopez',  'carlos@email.com',  'cliente123', 'CLIENTE'),
('Maria Garcia',  'maria@email.com',   'cliente123', 'CLIENTE');

-- Licencias
INSERT INTO tb_licencia (numeroLicencia, categoria, fechaVencimiento) VALUES
('Q12345678', 'A2', '2027-06-15'),
('Q87654321', 'A3', '2028-03-20'),
('Q11223344', 'B',  '2026-12-01');

-- Clientes (vinculados a usuarios)
INSERT INTO tb_cliente (nombre, apellidoPaterno, apellidoMaterno, dni, telefono, email, direccion, idLicencia, idUsuario) VALUES
('Carlos', 'Lopez',  'Rojas',   '12345678', '999111222', 'carlos@email.com', 'Av. Arequipa 123, Lima',   1, 2),
('Maria',  'Garcia', 'Torres',  '87654321', '999333444', 'maria@email.com',  'Jr. Cusco 456, Lima',     2, 3);

-- Marcas
INSERT INTO tb_marca (nombre, paisOrigen) VALUES
('Toyota',  'Japon'),
('BMW',     'Alemania'),
('Tesla',   'EEUU'),
('Hyundai', 'Corea del Sur');

-- Modelos
INSERT INTO tb_modelo (idMarca, nombre, categoria, numeroPasajeros) VALUES
(1, 'Corolla',        'Sedan',   5),
(1, 'RAV4',           'SUV',     5),
(1, 'Hilux',          'Pickup',  5),
(2, 'Serie 3',        'Sedan',   5),
(2, 'X5',             'SUV',     7),
(3, 'Model 3',        'Sedan',   5),
(3, 'Model Y',        'SUV',     5),
(4, 'Tucson',         'SUV',     5);

-- Autos
INSERT INTO tb_auto (placa, idMarca, idModelo, anio, color, kilometrajeActual, precioPorDia, precioPorHora, moraPorDia, estado) VALUES
('ABC-123', 1, 1, 2023, 'Blanco',  15000, 120.00, 15.00, 20.00, 'Disponible'),
('ABC-124', 1, 1, 2024, 'Negro',    8000, 130.00, 16.00, 20.00, 'Disponible'),
('ABC-125', 1, 2, 2023, 'Azul',    20000, 180.00, 22.00, 25.00, 'Disponible'),
('ABC-126', 2, 4, 2024, 'Gris',    10000, 250.00, 30.00, 30.00, 'Disponible'),
('ABC-127', 2, 5, 2024, 'Negro',    5000, 350.00, 40.00, 35.00, 'Disponible'),
('ABC-128', 3, 6, 2024, 'Rojo',     3000, 200.00, 25.00, 25.00, 'Disponible'),
('ABC-129', 3, 7, 2025, 'Blanco',   1500, 220.00, 28.00, 25.00, 'Disponible'),
('ABC-130', 4, 8, 2024, 'Verde',   12000, 150.00, 18.00, 20.00, 'Disponible'),
('ABC-131', 1, 3, 2023, 'Plata',   35000, 200.00, 25.00, 30.00, 'Disponible'),
('ABC-132', 1, 1, 2022, 'Azul',    45000, 100.00, 12.00, 15.00, 'Mantenimiento');

-- Catalogo de reparaciones
INSERT INTO tb_catalogo_reparacion (descripcion, costoEstimado, tiempoEstimadoHoras) VALUES
('Cambio de aceite y filtros',          150.00,  2),
('Cambio de pastillas de freno',        200.00,  3),
('Reparacion de abolladura leve',       300.00,  6),
('Cambio de neumatico',                 180.00,  1),
('Reparacion de aire acondicionado',    400.00,  5),
('Cambio de bateria',                   250.00,  1),
('Alineacion y balanceo',               120.00,  2);

-- Configuracion del sistema
INSERT INTO tb_configuracion (clave, valor, descripcion, tipo) VALUES
('app.version',        '1.0.0',  'Version del sistema',              'Sistema'),
('app.name',           'DRIVO',  'Nombre de la aplicacion',          'Sistema'),
('reserva.max_dias',   '30',     'Maximo de dias por reserva',       'Sistema'),
('reserva.hora_min',   '08:00',  'Hora minima de inicio',            'Sistema'),
('reserva.hora_max',   '20:00',  'Hora maxima de devolucion',        'Sistema'),
('mora.tasa_diaria',   '1.5',    'Tasa de mora diaria (%)',          'Sistema'),
('notificacion.email', 'true',   'Enviar notificaciones por email',  'Notificacion');

-- ============================================================
-- STORED PROCEDURES - REPORTES
-- ============================================================

-- 1. Stats del Dashboard
CREATE OR ALTER PROCEDURE sp_Dashboard_Stats
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        (SELECT COUNT(*) FROM tb_auto WHERE activo = 1) AS totalVehiculos,
        (SELECT COUNT(*) FROM tb_reserva WHERE estado IN ('Pendiente','Confirmada','En proceso')) AS reservasActivas,
        (SELECT ISNULL(SUM(total), 0) FROM tb_reserva 
         WHERE MONTH(fechaCreacion) = MONTH(GETDATE()) AND YEAR(fechaCreacion) = YEAR(GETDATE())) AS ingresosMes,
        (SELECT COUNT(*) FROM tb_cliente WHERE activo = 1 AND bloqueado = 0) AS clientesActivos;
END;
GO

-- 2. Reservas de hoy
CREATE OR ALTER PROCEDURE sp_Dashboard_ReservasHoy
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        r.idReserva,
        CONCAT(c.nombre, ' ', c.apellidoPaterno) AS clienteNombre,
        a.placa,
        r.horaInicio,
        r.horaFin,
        r.estado
    FROM tb_reserva r
    INNER JOIN tb_cliente c ON r.idCliente = c.idCliente
    INNER JOIN tb_auto a ON r.idAuto = a.idAuto
    WHERE r.fechaInicio <= CAST(GETDATE() AS DATE)
      AND r.fechaFin >= CAST(GETDATE() AS DATE)
      AND r.estado != 'Cancelada'
    ORDER BY r.horaInicio;
END;
GO

-- 3. Vehiculos en mantenimiento
CREATE OR ALTER PROCEDURE sp_Dashboard_VehiculosMantenimiento
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        a.placa,
        CONCAT(mr.nombre, ' ', mo.nombre) AS modelo,
        mt.fechaIngreso,
        mt.tipo
    FROM tb_mantenimiento mt
    INNER JOIN tb_auto a ON mt.idAuto = a.idAuto
    INNER JOIN tb_modelo mo ON a.idModelo = mo.idModelo
    INNER JOIN tb_marca mr ON a.idMarca = mr.idMarca
    WHERE mt.fechaSalida IS NULL
    ORDER BY mt.fechaIngreso;
END;
GO

-- 4. Ingresos mensuales (ultimos 6 meses)
CREATE OR ALTER PROCEDURE sp_Dashboard_IngresosMensuales
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        FORMAT(DATEADD(MONTH, -n, GETDATE()), 'MMM', 'es-PE') AS mes,
        ISNULL(SUM(r.total), 0) AS monto
    FROM (VALUES (0),(1),(2),(3),(4),(5)) AS meses(n)
    LEFT JOIN tb_reserva r ON MONTH(r.fechaCreacion) = MONTH(DATEADD(MONTH, -meses.n, GETDATE()))
        AND YEAR(r.fechaCreacion) = YEAR(DATEADD(MONTH, -meses.n, GETDATE()))
        AND r.estado NOT IN ('Cancelada')
    GROUP BY meses.n
    ORDER BY meses.n DESC;
END;
GO

-- 5. Reservas por cliente
CREATE OR ALTER PROCEDURE sp_Reporte_ReservasPorCliente
    @idCliente INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        r.idReserva,
        CONCAT(c.nombre, ' ', c.apellidoPaterno, ' ', ISNULL(c.apellidoMaterno,'')) AS cliente,
        c.dni,
        a.placa,
        CONCAT(mr.nombre, ' ', mo.nombre) AS vehiculo,
        r.fechaInicio,
        r.fechaFin,
        r.subtotal,
        r.mora,
        r.total,
        r.estado,
        r.fechaCreacion
    FROM tb_reserva r
    INNER JOIN tb_cliente c ON r.idCliente = c.idCliente
    INNER JOIN tb_auto a ON r.idAuto = a.idAuto
    INNER JOIN tb_modelo mo ON a.idModelo = mo.idModelo
    INNER JOIN tb_marca mr ON a.idMarca = mr.idMarca
    WHERE (@idCliente IS NULL OR r.idCliente = @idCliente)
    ORDER BY r.fechaCreacion DESC;
END;
GO

-- 6. Reservas por auto
CREATE OR ALTER PROCEDURE sp_Reporte_ReservasPorAuto
    @idAuto INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        r.idReserva,
        a.placa,
        CONCAT(mr.nombre, ' ', mo.nombre) AS vehiculo,
        CONCAT(c.nombre, ' ', c.apellidoPaterno) AS cliente,
        r.fechaInicio,
        r.fechaFin,
        r.total,
        r.estado,
        r.fechaCreacion
    FROM tb_reserva r
    INNER JOIN tb_auto a ON r.idAuto = a.idAuto
    INNER JOIN tb_modelo mo ON a.idModelo = mo.idModelo
    INNER JOIN tb_marca mr ON a.idMarca = mr.idMarca
    INNER JOIN tb_cliente c ON r.idCliente = c.idCliente
    WHERE (@idAuto IS NULL OR r.idAuto = @idAuto)
    ORDER BY r.fechaCreacion DESC;
END;
GO

-- 7. Ingresos por periodo
CREATE OR ALTER PROCEDURE sp_Reporte_IngresosPorPeriodo
    @fechaInicio DATE,
    @fechaFin DATE
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        FORMAT(r.fechaCreacion, 'yyyy-MM-dd') AS fecha,
        COUNT(r.idReserva) AS cantidadReservas,
        SUM(r.subtotal) AS totalSubtotal,
        SUM(r.mora) AS totalMora,
        SUM(r.costoReparaciones) AS totalReparaciones,
        SUM(r.total) AS totalIngresos
    FROM tb_reserva r
    WHERE r.fechaCreacion BETWEEN @fechaInicio AND @fechaFin
      AND r.estado NOT IN ('Cancelada')
    GROUP BY FORMAT(r.fechaCreacion, 'yyyy-MM-dd')
    ORDER BY fecha;
END;
GO

-- 8. Autos mas rentados
CREATE OR ALTER PROCEDURE sp_Reporte_AutosMasRentados
    @fechaInicio DATE = NULL,
    @fechaFin DATE = NULL,
    @top INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@top)
        a.placa,
        CONCAT(mr.nombre, ' ', mo.nombre) AS vehiculo,
        CONCAT(mr.nombre, ' ', mo.nombre, ' (', a.anio, ')') AS descripcion,
        COUNT(r.idReserva) AS totalReservas,
        ISNULL(SUM(r.total), 0) AS totalGenerado,
        a.precioPorDia,
        a.estado
    FROM tb_auto a
    INNER JOIN tb_modelo mo ON a.idModelo = mo.idModelo
    INNER JOIN tb_marca mr ON a.idMarca = mr.idMarca
    LEFT JOIN tb_reserva r ON a.idAuto = r.idAuto
        AND (@fechaInicio IS NULL OR r.fechaCreacion >= @fechaInicio)
        AND (@fechaFin IS NULL OR r.fechaCreacion <= @fechaFin)
        AND r.estado NOT IN ('Cancelada')
    WHERE a.activo = 1
    GROUP BY a.placa, mr.nombre, mo.nombre, a.anio, a.precioPorDia, a.estado
    ORDER BY totalReservas DESC;
END;
GO

-- 9. Clientes frecuentes
CREATE OR ALTER PROCEDURE sp_Reporte_ClientesFrecuentes
    @fechaInicio DATE = NULL,
    @fechaFin DATE = NULL,
    @top INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@top)
        c.idCliente,
        CONCAT(c.nombre, ' ', c.apellidoPaterno) AS cliente,
        c.dni,
        c.email,
        c.telefono,
        COUNT(r.idReserva) AS totalReservas,
        ISNULL(SUM(r.total), 0) AS totalGastado,
        c.numeroIncidentes,
        CASE WHEN c.bloqueado = 1 THEN 'Bloqueado' ELSE 'Activo' END AS estadoCliente
    FROM tb_cliente c
    LEFT JOIN tb_reserva r ON c.idCliente = r.idCliente
        AND (@fechaInicio IS NULL OR r.fechaCreacion >= @fechaInicio)
        AND (@fechaFin IS NULL OR r.fechaCreacion <= @fechaFin)
        AND r.estado NOT IN ('Cancelada')
    WHERE c.activo = 1
    GROUP BY c.idCliente, c.nombre, c.apellidoPaterno, c.dni, c.email, c.telefono, c.numeroIncidentes, c.bloqueado
    ORDER BY totalReservas DESC;
END;
GO

-- 10. Reparaciones por auto
CREATE OR ALTER PROCEDURE sp_Reporte_ReparacionesPorAuto
    @idAuto INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        rp.idReparacion,
        a.placa,
        CONCAT(mr.nombre, ' ', mo.nombre) AS vehiculo,
        cr.descripcion AS tipoReparacion,
        rp.descripcion,
        rp.costo,
        rp.estado,
        rp.responsable,
        rp.fechaReporte,
        rp.fechaInicio,
        rp.fechaFin,
        r.idReserva AS reservaRelacionada
    FROM tb_reparacion rp
    INNER JOIN tb_auto a ON rp.idAuto = a.idAuto
    INNER JOIN tb_modelo mo ON a.idModelo = mo.idModelo
    INNER JOIN tb_marca mr ON a.idMarca = mr.idMarca
    LEFT JOIN tb_catalogo_reparacion cr ON rp.idCatalogoReparacion = cr.idCatalogoReparacion
    LEFT JOIN tb_reserva r ON rp.idReserva = r.idReserva
    WHERE (@idAuto IS NULL OR rp.idAuto = @idAuto)
    ORDER BY rp.fechaReporte DESC;
END;
GO

-- 11. Consulta de autos disponibles en rango de fechas
CREATE OR ALTER PROCEDURE sp_AutosDisponiblesEnRango
    @fechaInicio DATE,
    @fechaFin DATE
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        a.idAuto,
        a.placa,
        a.anio,
        a.color,
        a.kilometrajeActual,
        a.precioPorDia,
        a.precioPorHora,
        a.moraPorDia,
        a.estado,
        mr.idMarca,
        mr.nombre AS marcaNombre,
        mo.idModelo,
        mo.nombre AS modeloNombre,
        mo.categoria,
        mo.numeroPasajeros
    FROM tb_auto a
    INNER JOIN tb_marca mr ON a.idMarca = mr.idMarca
    INNER JOIN tb_modelo mo ON a.idModelo = mo.idModelo
    WHERE a.activo = 1
      AND a.estado = 'Disponible'
      AND a.idAuto NOT IN (
          SELECT r.idAuto
          FROM tb_reserva r
          WHERE r.estado NOT IN ('Cancelada', 'Finalizada')
            AND r.fechaInicio < @fechaFin
            AND r.fechaFin > @fechaInicio
      )
    ORDER BY a.precioPorDia;
END;
GO

-- 12. Resumen de ganancias y ocupacion
CREATE OR ALTER PROCEDURE sp_Reporte_ResumenFinanciero
    @anio INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @anio IS NULL SET @anio = YEAR(GETDATE());
    
    SELECT 
        MONTH(fechaCreacion) AS mes,
        FORMAT(DATEFROMPARTS(@anio, MONTH(fechaCreacion), 1), 'MMMM', 'es-PE') AS nombreMes,
        COUNT(idReserva) AS totalReservas,
        SUM(subtotal) AS ingresosBrutos,
        SUM(mora) AS totalMoras,
        SUM(costoReparaciones) AS totalReparaciones,
        SUM(total) AS ingresosNetos,
        COUNT(DISTINCT idAuto) AS autosUtilizados,
        COUNT(DISTINCT idCliente) AS clientesAtendidos
    FROM tb_reserva
    WHERE YEAR(fechaCreacion) = @anio
      AND estado NOT IN ('Cancelada')
    GROUP BY MONTH(fechaCreacion)
    ORDER BY mes;
END;
GO

PRINT '>> Stored Procedures creados: 12';
PRINT '>> Base de datos DRIVO creada exitosamente.';
PRINT '>> Usuarios de prueba:';
PRINT '>>   ADMIN:  admin@drivo.com  / admin123';
PRINT '>>   CLIENTE: carlos@email.com / cliente123';
PRINT '>>   CLIENTE: maria@email.com  / cliente123';
