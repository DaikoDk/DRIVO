-- ============================================================
--  SETUP COMPLETO - BD_RentCar (AlquilerAuto)
--  Unifica: DRIVO_BD.sql + DRIVO_SP.sql + DRIVO_SEED_MAS_DATOS.sql
--  Ejecutar en 1 sola pasada con sqlcmd o SSMS.
-- ============================================================

-- ============================================================
--  CREACION DE BASE DE DATOS - ALQUILER AUTO (BD_RentCar)
--  Motor: SQL Server  |  Proyecto: EFSRT - AlquilerAuto
--  Fecha: 19/06/2026  |  Flujo: check-in + 8 estados con FK
-- ============================================================

-- CREAR BASE DE DATOS (elimina version anterior si existe)
USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'BD_RentCar')
BEGIN
    ALTER DATABASE BD_RentCar SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE BD_RentCar;
END
GO

-- Verificar que el DROP funciono antes de continuar
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'BD_RentCar')
BEGIN
    RAISERROR('No se pudo eliminar BD_RentCar. Cierra todas las conexiones (SSMS, backend) y vuelve a intentar.', 18, 1) WITH LOG;
    RETURN;
END
GO

CREATE DATABASE BD_RentCar;
GO

USE BD_RentCar;
GO

-- Desactivar cache de IDENTITY para evitar saltos de 1000 al reiniciar
ALTER DATABASE SCOPED CONFIGURATION SET IDENTITY_CACHE = OFF;
GO

-- ============================================================
--  SECCION 1: ELIMINAR TABLAS EXISTENTES (orden inverso de FK)
-- ============================================================
IF OBJECT_ID('dbo.tb_historial_kilometraje', 'U') IS NOT NULL DROP TABLE dbo.tb_historial_kilometraje;
IF OBJECT_ID('dbo.tb_reparacion', 'U') IS NOT NULL DROP TABLE dbo.tb_reparacion;
IF OBJECT_ID('dbo.tb_catalogo_reparacion', 'U') IS NOT NULL DROP TABLE dbo.tb_catalogo_reparacion;
IF OBJECT_ID('dbo.tb_pago', 'U') IS NOT NULL DROP TABLE dbo.tb_pago;
IF OBJECT_ID('dbo.tb_mantenimiento', 'U') IS NOT NULL DROP TABLE dbo.tb_mantenimiento;
IF OBJECT_ID('dbo.tb_reserva', 'U') IS NOT NULL DROP TABLE dbo.tb_reserva;
IF OBJECT_ID('dbo.tb_estado', 'U') IS NOT NULL DROP TABLE dbo.tb_estado;
IF OBJECT_ID('dbo.tb_auto', 'U') IS NOT NULL DROP TABLE dbo.tb_auto;
IF OBJECT_ID('dbo.tb_modelo', 'U') IS NOT NULL DROP TABLE dbo.tb_modelo;
IF OBJECT_ID('dbo.tb_marca', 'U') IS NOT NULL DROP TABLE dbo.tb_marca;
IF OBJECT_ID('dbo.tb_cliente', 'U') IS NOT NULL DROP TABLE dbo.tb_cliente;
IF OBJECT_ID('dbo.tb_licencia', 'U') IS NOT NULL DROP TABLE dbo.tb_licencia;
IF OBJECT_ID('dbo.tb_configuracion', 'U') IS NOT NULL DROP TABLE dbo.tb_configuracion;
IF OBJECT_ID('dbo.tb_usuario', 'U') IS NOT NULL DROP TABLE dbo.tb_usuario;
GO

-- ============================================================
--  SECCION 2: CREACION DE TABLAS
-- ============================================================

-- 2.1 tb_marca -------------------------------------------------
CREATE TABLE tb_marca (
    idMarca     INT IDENTITY(1,1)   NOT NULL,
    nombre      VARCHAR(50)         NOT NULL,
    paisOrigen  VARCHAR(50),
    activo      BIT                 NOT NULL DEFAULT 1,
    fechaRegistro DATETIME          NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Marca PRIMARY KEY CLUSTERED (idMarca),
    CONSTRAINT UQ_Marca_Nombre UNIQUE (nombre)
);
GO

-- 2.2 tb_modelo ------------------------------------------------
CREATE TABLE tb_modelo (
    idModelo        INT IDENTITY(1,1)   NOT NULL,
    idMarca         INT                 NOT NULL,
    nombre          VARCHAR(50)         NOT NULL,
    categoria       VARCHAR(30),
    numeroPasajeros INT                 DEFAULT 5,
    activo          BIT                 NOT NULL DEFAULT 1,
    fechaRegistro   DATETIME            NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Modelo PRIMARY KEY CLUSTERED (idModelo),
    CONSTRAINT FK_Modelo_Marca FOREIGN KEY (idMarca) REFERENCES tb_marca(idMarca),
    CONSTRAINT CK_Modelo_Categoria CHECK (categoria IN ('Sedan','SUV','Hatchback','Pickup','Deportivo','Van','Coupe','Convertible')),
    CONSTRAINT CK_Modelo_Pasajeros CHECK (numeroPasajeros >= 2 AND numeroPasajeros <= 15)
);
GO

-- 2.3 tb_auto --------------------------------------------------
CREATE TABLE tb_auto (
    idAuto                  INT IDENTITY(1,1)   NOT NULL,
    placa                   VARCHAR(10)         NOT NULL,
    idMarca                 INT                 NOT NULL,
    idModelo                INT                 NOT NULL,
    anio                    INT                 NOT NULL,
    color                   VARCHAR(30),
    numeroMotor             VARCHAR(50),
    numeroChasis            VARCHAR(50),
    kilometrajeActual       INT                 NOT NULL DEFAULT 0,
    ultimaRevisionKm        INT,
    proximaRevisionKm       INT,
    precioPorDia            DECIMAL(10,2)       NOT NULL,
    precioPorHora           DECIMAL(10,2),
    moraPorDia              DECIMAL(10,2)       NOT NULL DEFAULT 0,
    estado                  VARCHAR(20)         NOT NULL DEFAULT 'Disponible',
    activo                  BIT                 NOT NULL DEFAULT 1,
    fechaRegistro           DATETIME            NOT NULL DEFAULT GETDATE(),
    fechaUltimaActualizacion DATETIME,
    fotoUrl                 VARCHAR(500),
    CONSTRAINT PK_Auto PRIMARY KEY CLUSTERED (idAuto),
    CONSTRAINT UQ_Auto_Placa UNIQUE (placa),
    CONSTRAINT FK_Auto_Marca FOREIGN KEY (idMarca) REFERENCES tb_marca(idMarca),
    CONSTRAINT FK_Auto_Modelo FOREIGN KEY (idModelo) REFERENCES tb_modelo(idModelo),
    CONSTRAINT CK_Auto_Anio CHECK (anio >= 1990),
    CONSTRAINT CK_Auto_Kilometraje CHECK (kilometrajeActual >= 0),
    CONSTRAINT CK_Auto_PrecioDia CHECK (precioPorDia > 0),
    CONSTRAINT CK_Auto_PrecioHora CHECK (precioPorHora IS NULL OR precioPorHora > 0),
    CONSTRAINT CK_Auto_Mora CHECK (moraPorDia >= 0),
    CONSTRAINT CK_Auto_Estado CHECK (estado IN ('Disponible','Reservado','En proceso','En reparación'))
);
GO

-- 2.4 tb_licencia ----------------------------------------------
CREATE TABLE tb_licencia (
    idLicencia          INT IDENTITY(1,1)   NOT NULL,
    numeroLicencia      VARCHAR(30)         NOT NULL,
    categoria           VARCHAR(10)         NOT NULL,
    fechaVencimiento    DATE                NOT NULL,
    CONSTRAINT PK_Licencia PRIMARY KEY CLUSTERED (idLicencia),
    CONSTRAINT UQ_Licencia_Numero UNIQUE (numeroLicencia),
    CONSTRAINT CK_Licencia_Categoria CHECK (categoria IN ('A-I','A-IIa','A-IIb','A-IIIa','A-IIIb','A-IIIc'))
);
GO

-- 2.5 tb_usuario ----------------------------------------------
CREATE TABLE tb_usuario (
    IdUsuario       INT IDENTITY(1,1)   NOT NULL,
    Nombre          VARCHAR(100)        NOT NULL,
    Correo          VARCHAR(100)        NOT NULL,
    Clave           VARCHAR(255)        NOT NULL,
    Rol             VARCHAR(30)         NOT NULL,
    Activo          BIT                 NOT NULL DEFAULT 1,
    FechaRegistro   DATETIME            NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Usuario PRIMARY KEY CLUSTERED (IdUsuario),
    CONSTRAINT UQ_Usuario_Correo UNIQUE (Correo),
    CONSTRAINT CK_Usuario_Rol CHECK (Rol IN ('ADMIN','TRABAJADOR','CLIENTE'))
);
GO

-- 2.6 tb_cliente -----------------------------------------------
CREATE TABLE tb_cliente (
    idCliente           INT IDENTITY(1,1)   NOT NULL,
    nombre              VARCHAR(50)         NOT NULL,
    apellidoPaterno     VARCHAR(50)         NOT NULL,
    apellidoMaterno     VARCHAR(50),
    dni                 VARCHAR(15)         NOT NULL,
    telefono            VARCHAR(20),
    email               VARCHAR(100)        NOT NULL,
    direccion           VARCHAR(200),
    idLicencia          INT,
    idUsuario           INT                 NULL,
    numeroReservas      INT                 NOT NULL DEFAULT 0,
    numeroIncidentes    INT                 NOT NULL DEFAULT 0,
    bloqueado           BIT                 NOT NULL DEFAULT 0,
    estado              VARCHAR(20)         NOT NULL DEFAULT 'activo',
    activo              BIT                 NOT NULL DEFAULT 1,
    fechaRegistro       DATETIME            NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Cliente PRIMARY KEY CLUSTERED (idCliente),
    CONSTRAINT UQ_Cliente_DNI UNIQUE (dni),
    CONSTRAINT UQ_Cliente_Email UNIQUE (email),
    CONSTRAINT FK_Cliente_Licencia FOREIGN KEY (idLicencia) REFERENCES tb_licencia(idLicencia),
    CONSTRAINT FK_Cliente_Usuario FOREIGN KEY (idUsuario) REFERENCES tb_usuario(IdUsuario),
    CONSTRAINT CK_Cliente_Estado CHECK (estado IN ('activo','inactivo')),
    CONSTRAINT CK_Cliente_Reservas CHECK (numeroReservas >= 0),
    CONSTRAINT CK_Cliente_Incidentes CHECK (numeroIncidentes >= 0)
);
GO

-- 2.7 tb_estado (catalogo de estados por entidad) ---------------
CREATE TABLE tb_estado (
    id_estado    INT IDENTITY(1,1)  NOT NULL,
    entidad      VARCHAR(20)        NOT NULL,
    codigo       VARCHAR(30)        NOT NULL,
    nombre       VARCHAR(50)        NOT NULL,
    descripcion  VARCHAR(200)       NULL,
    orden        INT                NOT NULL DEFAULT 0,
    activo       BIT                NOT NULL DEFAULT 1,
    CONSTRAINT PK_Estado PRIMARY KEY CLUSTERED (id_estado),
    CONSTRAINT UQ_Estado_Entidad_Codigo UNIQUE (entidad, codigo)
);
GO

-- 2.8 tb_reserva (con FK a tb_estado) --------------------------
CREATE TABLE tb_reserva (
    idReserva               INT IDENTITY(1,1)   NOT NULL,
    idCliente               INT                 NOT NULL,
    idAuto                  INT                 NOT NULL,
    id_estado               INT                 NOT NULL,
    fechaInicio             DATE                NOT NULL,
    horaInicio              TIME                NOT NULL,
    fechaFin                DATE                NOT NULL,
    horaFin                 TIME                NOT NULL,
    kilometrajeInicio       INT,
    kilometrajeFin          INT,
    subtotal                DECIMAL(10,2)       NOT NULL,
    mora                    DECIMAL(10,2)       NOT NULL DEFAULT 0,
    costoReparaciones       DECIMAL(10,2)       NOT NULL DEFAULT 0,
    total                   DECIMAL(10,2)       NOT NULL,
    estadoEntrega           VARCHAR(30)         NOT NULL DEFAULT 'Sin entregar',
    observacionesEntrega    VARCHAR(500),
    fechaHoraInicioReal     DATETIME,
    fechaHoraFinReal        DATETIME,
    fechaHoraCheckIn        DATETIME            NULL,
    fechaCreacion           DATETIME            NOT NULL DEFAULT GETDATE(),
    usuarioCreacion         VARCHAR(100),
    fechaFinalizacion       DATETIME,
    usuarioFinalizacion     VARCHAR(100),
    CONSTRAINT PK_Reserva PRIMARY KEY CLUSTERED (idReserva),
    CONSTRAINT FK_Reserva_Cliente FOREIGN KEY (idCliente) REFERENCES tb_cliente(idCliente),
    CONSTRAINT FK_Reserva_Auto FOREIGN KEY (idAuto) REFERENCES tb_auto(idAuto),
    CONSTRAINT FK_Reserva_Estado FOREIGN KEY (id_estado) REFERENCES tb_estado(id_estado),
    CONSTRAINT CK_Reserva_Fechas CHECK (fechaFin >= fechaInicio),
    CONSTRAINT CK_Reserva_Subtotal CHECK (subtotal >= 0),
    CONSTRAINT CK_Reserva_Mora CHECK (mora >= 0),
    CONSTRAINT CK_Reserva_CostoRep CHECK (costoReparaciones >= 0),
    CONSTRAINT CK_Reserva_Total CHECK (total >= 0),
    CONSTRAINT CK_Reserva_EstadoEntrega CHECK (estadoEntrega IN ('Sin entregar','Entregado OK','Entregado con daños','Entregado con retraso'))
);
GO

-- 2.9 tb_pago --------------------------------------------------
CREATE TABLE tb_pago (
    idPago              INT IDENTITY(1,1)   NOT NULL,
    idReserva           INT                 NOT NULL,
    montoBase           DECIMAL(10,2)       NOT NULL,
    montoMora           DECIMAL(10,2)       NOT NULL DEFAULT 0,
    montoDanos          DECIMAL(10,2)       NOT NULL DEFAULT 0,
    montoTotalPagado    DECIMAL(10,2)       NOT NULL,
    fechaPago           DATETIME            NOT NULL DEFAULT GETDATE(),
    metodoPago          VARCHAR(30)         NOT NULL,
    CONSTRAINT PK_Pago PRIMARY KEY CLUSTERED (idPago),
    CONSTRAINT FK_Pago_Reserva FOREIGN KEY (idReserva) REFERENCES tb_reserva(idReserva),
    CONSTRAINT CK_Pago_MontoBase CHECK (montoBase >= 0),
    CONSTRAINT CK_Pago_MontoMora CHECK (montoMora >= 0),
    CONSTRAINT CK_Pago_MontoDanos CHECK (montoDanos >= 0),
    CONSTRAINT CK_Pago_MontoTotal CHECK (montoTotalPagado >= 0),
    CONSTRAINT CK_Pago_Metodo CHECK (metodoPago IN ('Tarjeta','Efectivo','Transferencia'))
);
GO

-- 2.10 tb_catalogo_reparacion -----------------------------------
CREATE TABLE tb_catalogo_reparacion (
    idCatalogoReparacion    INT IDENTITY(1,1)   NOT NULL,
    descripcion             VARCHAR(200)        NOT NULL,
    costoEstimado           DECIMAL(10,2)       NOT NULL DEFAULT 0,
    tiempoEstimadoHoras     INT                 NOT NULL DEFAULT 0,
    activo                  BIT                 NOT NULL DEFAULT 1,
    fechaRegistro           DATETIME            NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_CatalogoReparacion PRIMARY KEY CLUSTERED (idCatalogoReparacion),
    CONSTRAINT CK_Catalogo_Costo CHECK (costoEstimado >= 0),
    CONSTRAINT CK_Catalogo_Tiempo CHECK (tiempoEstimadoHoras >= 0)
);
GO

-- 2.11 tb_reparacion --------------------------------------------
CREATE TABLE tb_reparacion (
    idReparacion            INT IDENTITY(1,1)   NOT NULL,
    idReserva               INT                 NOT NULL,
    idAuto                  INT                 NOT NULL,
    idCatalogoReparacion    INT,
    descripcion             VARCHAR(500)        NOT NULL,
    costo                   DECIMAL(10,2)       NOT NULL,
    estado                  VARCHAR(20)         NOT NULL DEFAULT 'Pendiente',
    responsable             VARCHAR(30),
    fechaReporte            DATETIME            NOT NULL DEFAULT GETDATE(),
    fechaInicio             DATETIME,
    fechaFin                DATETIME,
    usuarioReporte          VARCHAR(100),
    CONSTRAINT PK_Reparacion PRIMARY KEY CLUSTERED (idReparacion),
    CONSTRAINT FK_Reparacion_Reserva FOREIGN KEY (idReserva) REFERENCES tb_reserva(idReserva),
    CONSTRAINT FK_Reparacion_Auto FOREIGN KEY (idAuto) REFERENCES tb_auto(idAuto),
    CONSTRAINT FK_Reparacion_Catalogo FOREIGN KEY (idCatalogoReparacion) REFERENCES tb_catalogo_reparacion(idCatalogoReparacion),
    CONSTRAINT CK_Reparacion_Costo CHECK (costo >= 0),
    CONSTRAINT CK_Reparacion_Estado CHECK (estado IN ('Pendiente','En proceso','Completada','Cancelada')),
    CONSTRAINT CK_Reparacion_Responsable CHECK (responsable IN ('Cliente','Empresa','Seguro'))
);
GO

-- 2.12 tb_mantenimiento ----------------------------------------
CREATE TABLE tb_mantenimiento (
    idMantenimiento     INT IDENTITY(1,1)   NOT NULL,
    idAuto              INT                 NOT NULL,
    fechaIngreso        DATE                NOT NULL,
    fechaSalida         DATE,
    tipo                VARCHAR(20)         NOT NULL,
    costo               DECIMAL(10,2)       NOT NULL DEFAULT 0,
    detalle             VARCHAR(MAX),
    CONSTRAINT PK_Mantenimiento PRIMARY KEY CLUSTERED (idMantenimiento),
    CONSTRAINT FK_Mantenimiento_Auto FOREIGN KEY (idAuto) REFERENCES tb_auto(idAuto),
    CONSTRAINT CK_Mantenimiento_Tipo CHECK (tipo IN ('Preventivo','Correctivo')),
    CONSTRAINT CK_Mantenimiento_Costo CHECK (costo >= 0)
);
GO

-- 2.13 tb_historial_kilometraje --------------------------------
CREATE TABLE tb_historial_kilometraje (
    idHistorial         INT IDENTITY(1,1)   NOT NULL,
    idAuto              INT                 NOT NULL,
    idReserva           INT,
    kilometrajeAnterior INT                 NOT NULL,
    kilometrajeNuevo    INT                 NOT NULL,
    diferencia          AS (kilometrajeNuevo - kilometrajeAnterior) PERSISTED,
    tipoRegistro        VARCHAR(30)         NOT NULL DEFAULT 'Reserva',
    observaciones       VARCHAR(300),
    fechaRegistro       DATETIME            NOT NULL DEFAULT GETDATE(),
    usuarioRegistro     VARCHAR(100),
    CONSTRAINT PK_HistorialKm PRIMARY KEY CLUSTERED (idHistorial),
    CONSTRAINT FK_HistorialKm_Auto FOREIGN KEY (idAuto) REFERENCES tb_auto(idAuto),
    CONSTRAINT FK_HistorialKm_Reserva FOREIGN KEY (idReserva) REFERENCES tb_reserva(idReserva),
    CONSTRAINT CK_HistorialKm_Tipo CHECK (tipoRegistro IN ('Reserva','Mantenimiento','Ajuste manual')),
    CONSTRAINT CK_HistorialKm_Valores CHECK (kilometrajeAnterior >= 0 AND kilometrajeNuevo >= 0)
);
GO

-- 2.14 tb_configuracion ----------------------------------------
CREATE TABLE tb_configuracion (
    idConfiguracion     INT IDENTITY(1,1)   NOT NULL,
    clave               VARCHAR(50)         NOT NULL,
    valor               VARCHAR(200)        NOT NULL,
    descripcion         VARCHAR(300),
    tipo                VARCHAR(20),
    fechaActualizacion  DATETIME            NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Configuracion PRIMARY KEY CLUSTERED (idConfiguracion),
    CONSTRAINT UQ_Configuracion_Clave UNIQUE (clave),
    CONSTRAINT CK_Configuracion_Tipo CHECK (tipo IN ('decimal','entero','texto','booleano'))
);
GO

-- ============================================================
--  SECCION 3: INDICES ADICIONALES
-- ============================================================
CREATE INDEX IX_Auto_Estado    ON tb_auto(estado)    WHERE activo = 1;
CREATE INDEX IX_Auto_Marca     ON tb_auto(idMarca);
CREATE INDEX IX_Auto_Modelo    ON tb_auto(idModelo);
CREATE INDEX IX_Cliente_DNI    ON tb_cliente(dni);
CREATE INDEX IX_Cliente_Estado ON tb_cliente(estado) WHERE activo = 1;
CREATE INDEX IX_Reserva_Cliente ON tb_reserva(idCliente, id_estado);
CREATE INDEX IX_Reserva_Auto    ON tb_reserva(idAuto, id_estado);
CREATE INDEX IX_Reserva_Fechas  ON tb_reserva(fechaInicio, fechaFin);
CREATE INDEX IX_Pago_Reserva    ON tb_pago(idReserva);
CREATE INDEX IX_Reparacion_Reserva ON tb_reparacion(idReserva);
CREATE INDEX IX_Mantenimiento_Auto ON tb_mantenimiento(idAuto);
CREATE INDEX IX_HistorialKm_Auto   ON tb_historial_kilometraje(idAuto);
GO

-- ============================================================
--  SECCION 4: TRIGGERS
-- ============================================================

-- Trigger: Actualizar fechaUltimaActualizacion en tb_auto
CREATE TRIGGER trg_Auto_Actualizacion
ON tb_auto
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE tb_auto
    SET fechaUltimaActualizacion = GETDATE()
    FROM tb_auto a
    INNER JOIN inserted i ON a.idAuto = i.idAuto;
END;
GO

-- Trigger: Actualizar kilometrajeActual del auto al finalizar reserva
CREATE TRIGGER trg_Reserva_Finalizar
ON tb_reserva
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @idEntregado INT = (
        SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_ENTREGADO'
    );

    IF UPDATE(id_estado) AND EXISTS (
        SELECT 1 FROM inserted WHERE id_estado = @idEntregado AND kilometrajeFin IS NOT NULL
    )
    BEGIN
        UPDATE tb_auto
        SET kilometrajeActual = i.kilometrajeFin
        FROM tb_auto a
        INNER JOIN inserted i ON a.idAuto = i.idAuto
        WHERE i.id_estado = @idEntregado AND i.kilometrajeFin IS NOT NULL;
    END
END;
GO

-- ============================================================
--  SECCION 5: VISTAS PARA REPORTES
-- ============================================================

-- Vista: Autos con informacion completa
CREATE OR ALTER VIEW vw_Auto_Completo AS
SELECT
    a.idAuto, a.placa, m.nombre AS marca, mo.nombre AS modelo, mo.categoria,
    a.anio, a.color, a.numeroMotor, a.numeroChasis,
    a.kilometrajeActual, a.ultimaRevisionKm, a.proximaRevisionKm,
    a.precioPorDia, a.precioPorHora, a.moraPorDia, a.estado, a.activo, a.fotoUrl
FROM tb_auto a
INNER JOIN tb_marca m ON a.idMarca = m.idMarca
INNER JOIN tb_modelo mo ON a.idModelo = mo.idModelo;
GO

-- Vista: Reservas con detalles de cliente y auto
CREATE OR ALTER VIEW vw_Reserva_Detalle AS
SELECT
    r.idReserva,
    c.idCliente,
    c.dni AS dniCliente,
    c.nombre + ' ' + c.apellidoPaterno + ISNULL(' ' + c.apellidoMaterno, '') AS nombreCliente,
    c.telefono, c.email,
    a.idAuto,
    a.placa,
    m.nombre AS marca,
    mo.nombre AS modelo,
    a.color AS colorAuto,
    r.fechaInicio, r.horaInicio, r.fechaFin, r.horaFin,
    r.kilometrajeInicio, r.kilometrajeFin,
    r.kilometrajeFin - r.kilometrajeInicio AS kilometrosRecorridos,
    r.subtotal, r.mora, r.costoReparaciones, r.total,
    e.codigo AS estado,
    r.estadoEntrega,
    r.fechaHoraInicioReal, r.fechaHoraFinReal,
    r.fechaHoraCheckIn,
    r.fechaCreacion, r.usuarioCreacion
FROM tb_reserva r
INNER JOIN tb_cliente c ON r.idCliente = c.idCliente
INNER JOIN tb_auto a ON r.idAuto = a.idAuto
INNER JOIN tb_marca m ON a.idMarca = m.idMarca
INNER JOIN tb_modelo mo ON a.idModelo = mo.idModelo
INNER JOIN tb_estado e ON r.id_estado = e.id_estado;
GO

-- Vista: Reporte de ingresos por periodo
CREATE OR ALTER VIEW vw_Ingresos_Periodo AS
SELECT
    YEAR(r.fechaFinalizacion) AS anio,
    MONTH(r.fechaFinalizacion) AS mes,
    COUNT(r.idReserva) AS totalReservasFinalizadas,
    ISNULL(SUM(r.subtotal), 0) AS totalSubtotal,
    ISNULL(SUM(r.mora), 0) AS totalMora,
    ISNULL(SUM(r.costoReparaciones), 0) AS totalReparaciones,
    ISNULL(SUM(r.total), 0) AS totalIngresos,
    ISNULL(SUM(p.montoTotalPagado), 0) AS totalPagado
FROM tb_reserva r
LEFT JOIN tb_pago p ON r.idReserva = p.idReserva
WHERE r.id_estado = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_FINALIZADO')
GROUP BY YEAR(r.fechaFinalizacion), MONTH(r.fechaFinalizacion);
GO

-- ============================================================
--  SECCION 6: DATOS SEMILLA (maximo 3 por tabla)
-- ============================================================

-- 6.1 Estados (catalogo) ----------------------------------------
INSERT INTO tb_estado (entidad, codigo, nombre, descripcion, orden) VALUES
-- RESERVA (8)
('RESERVA', 'RESERVA_PENDIENTE',   'Pendiente',   'Reserva creada, esperando check-in del cliente',       1),
('RESERVA', 'RESERVA_CONFIRMADA',  'Confirmada',  'Cliente hizo check-in, esperando fecha de inicio',      2),
('RESERVA', 'RESERVA_CANCELADA',   'Cancelada',   'Cancelada manualmente por cliente o admin',             3),
('RESERVA', 'RESERVA_EXPIRADA',    'Expirada',    'Check-in no realizado dentro del plazo',                 4),
('RESERVA', 'ALQUILER_EN_CURSO',   'En curso',    'Alquiler activo, auto en posesion del cliente',          5),
('RESERVA', 'ALQUILER_EN_DEMORA',  'En demora',   'Cliente no ha devuelto el auto pasado el tiempo limite', 6),
('RESERVA', 'ALQUILER_ENTREGADO',  'Entregado',   'Auto devuelto por el cliente',                          7),
('RESERVA', 'ALQUILER_FINALIZADO', 'Finalizado',  'Pago procesado, reserva completada',                    8),

-- AUTO (4)
('AUTO',    'DISPONIBLE',     'Disponible',     'Listo para alquilar',              1),
('AUTO',    'RESERVADO',      'Reservado',      'Bloqueado por una reserva futura', 2),
('AUTO',    'EN_PROCESO',     'En proceso',     'Actualmente alquilado',            3),
('AUTO',    'EN_REPARACION',  'En reparación',  'En taller',                        4),

-- CLIENTE (2)
('CLIENTE', 'ACTIVO',   'Activo',   'Cliente habilitado para alquilar',    1),
('CLIENTE', 'INACTIVO', 'Inactivo', 'Cliente deshabilitado',               2),

-- REPARACION (4)
('REPARACION', 'PENDIENTE',   'Pendiente',   'Reparacion registrada, sin iniciar', 1),
('REPARACION', 'EN_PROCESO',  'En proceso',  'Reparacion en taller',               2),
('REPARACION', 'COMPLETADA',  'Completada',  'Reparacion finalizada',               3),
('REPARACION', 'CANCELADA',   'Cancelada',   'Reparacion cancelada',                4);
GO

-- 6.2 Marcas (3) -----------------------------------------------
SET IDENTITY_INSERT tb_marca ON;
INSERT INTO tb_marca (idMarca, nombre, paisOrigen) VALUES
(1, 'Toyota', 'Japon'),
(2, 'Hyundai', 'Corea del Sur'),
(3, 'Kia', 'Corea del Sur');
SET IDENTITY_INSERT tb_marca OFF;
GO

-- 6.3 Modelos (3) ----------------------------------------------
SET IDENTITY_INSERT tb_modelo ON;
INSERT INTO tb_modelo (idModelo, idMarca, nombre, categoria, numeroPasajeros) VALUES
(1, 1, 'Yaris', 'Sedan', 5),
(2, 2, 'Accent', 'Sedan', 5),
(3, 3, 'Rio', 'Hatchback', 5);
SET IDENTITY_INSERT tb_modelo OFF;
GO

-- 6.4 Autos (3) ------------------------------------------------
-- Disponible: listo para alquilar
-- En proceso: actualmente alquilado (reserva activa)
-- En reparacion: en taller
SET IDENTITY_INSERT tb_auto ON;
INSERT INTO tb_auto (idAuto, placa, idMarca, idModelo, anio, color, kilometrajeActual, ultimaRevisionKm, proximaRevisionKm, precioPorDia, precioPorHora, moraPorDia, estado, fotoUrl) VALUES
(1, 'ABC-123', 1, 1, 2020, 'Blanco', 45500, 40000, 50000, 120.00, 15.00, 30.00, 'Disponible',  NULL),
(2, 'DEF-456', 2, 2, 2019, 'Negro',  52300, 48000, 58000, 110.00, 13.00, 25.00, 'En proceso',  NULL),
(3, 'GHI-789', 3, 3, 2021, 'Rojo',   38000, 35000, 40000, 130.00, 16.00, 30.00, 'En reparación', NULL);
SET IDENTITY_INSERT tb_auto OFF;
GO

-- 6.5 Licencias (3) --------------------------------------------
SET IDENTITY_INSERT tb_licencia ON;
INSERT INTO tb_licencia (idLicencia, numeroLicencia, categoria, fechaVencimiento) VALUES
(1, 'Q12345678', 'A-IIa', '2027-06-15'),
(2, 'Q87654321', 'A-IIa', '2027-12-20'),
(3, 'Q11223344', 'A-I',   '2028-03-10');
SET IDENTITY_INSERT tb_licencia OFF;
GO

-- 6.6 Clientes (3) ---------------------------------------------
SET IDENTITY_INSERT tb_cliente ON;
INSERT INTO tb_cliente (idCliente, nombre, apellidoPaterno, apellidoMaterno, dni, telefono, email, direccion, idLicencia, numeroReservas, estado) VALUES
(1, 'Juan',   'Perez',  'Garcia',  '12345678', '987654321', 'juanperez@example.com',   'Av. Los Olivos 123, Lima',   1, 1, 'activo'),
(2, 'Maria',  'Lopez',  'Flores',  '87654321', '912345678', 'marialopez@example.com',  'Jr. Las Palmeras 456, Lima', 2, 1, 'activo'),
(3, 'Carlos', 'Gomez',  'Rios',    '11223344', '999555444', 'carlosgomez@example.com', 'Calle Real 789, Callao',     3, 1, 'activo');
SET IDENTITY_INSERT tb_cliente OFF;
GO

-- 6.7 Reservas (3) ---------------------------------------------
-- #1: Finalizada OK (cliente Maria, auto Yaris)
-- #2: Finalizada con danos (cliente Carlos, auto Yaris)
-- #3: En curso - activa (cliente Juan, auto Accent, cruza fecha actual)

DECLARE @estadoFinalizado INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_FINALIZADO');
DECLARE @estadoEnCurso   INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_EN_CURSO');

SET IDENTITY_INSERT tb_reserva ON;
INSERT INTO tb_reserva (idReserva, idCliente, idAuto, id_estado, fechaInicio, horaInicio, fechaFin, horaFin, kilometrajeInicio, subtotal, total, estadoEntrega, fechaCreacion, usuarioCreacion, fechaHoraInicioReal, fechaFinalizacion, usuarioFinalizacion) VALUES
(1, 2, 1, @estadoFinalizado, '2026-05-10', '09:00', '2026-05-12', '18:00', 45000, 360.00, 360.00, 'Entregado OK',           '2026-05-08 10:30:00', 'admin', '2026-05-10 09:00:00', '2026-05-12 17:45:00', 'admin'),
(2, 3, 1, @estadoFinalizado, '2026-05-20', '08:00', '2026-05-22', '20:00', 45500, 450.00, 520.00, 'Entregado con daños',    '2026-05-18 14:00:00', 'admin', '2026-05-20 08:00:00', '2026-05-22 18:00:00', 'admin'),
(3, 1, 2, @estadoEnCurso,    '2026-06-15', '10:00', '2026-06-20', '16:00', 52300, 660.00, 660.00, 'Sin entregar',           '2026-06-14 09:00:00', 'admin', '2026-06-15 10:00:00', NULL, NULL);
SET IDENTITY_INSERT tb_reserva OFF;
GO

-- Actualizar kilometrajeFin de las finalizadas
UPDATE tb_reserva SET kilometrajeFin = 45500, fechaHoraFinReal = '2026-05-12 17:45:00' WHERE idReserva = 1;
UPDATE tb_reserva SET kilometrajeFin = 45800, fechaHoraFinReal = '2026-05-22 18:00:00', costoReparaciones = 70.00, observacionesEntrega = 'Rayon leve en puerta trasera' WHERE idReserva = 2;
GO

-- 6.8 Pagos (2) ------------------------------------------------
SET IDENTITY_INSERT tb_pago ON;
INSERT INTO tb_pago (idPago, idReserva, montoBase, montoMora, montoDanos, montoTotalPagado, fechaPago, metodoPago) VALUES
(1, 1, 360.00, 0,    0,     360.00, '2026-05-12 17:50:00', 'Tarjeta'),
(2, 2, 450.00, 0,    70.00, 520.00, '2026-05-22 18:10:00', 'Efectivo');
SET IDENTITY_INSERT tb_pago OFF;
GO

-- 6.9 Catalogo de Reparaciones (3) -----------------------------
SET IDENTITY_INSERT tb_catalogo_reparacion ON;
INSERT INTO tb_catalogo_reparacion (idCatalogoReparacion, descripcion, costoEstimado, tiempoEstimadoHoras) VALUES
(1, 'Rayon de pintura', 200.00, 4),
(2, 'Abolladura de carroceria', 500.00, 8),
(3, 'Rotura de espejo lateral', 150.00, 2);
SET IDENTITY_INSERT tb_catalogo_reparacion OFF;
GO

-- 6.10 Reparaciones (1) -----------------------------------------
SET IDENTITY_INSERT tb_reparacion ON;
INSERT INTO tb_reparacion (idReparacion, idReserva, idAuto, idCatalogoReparacion, descripcion, costo, estado, responsable, fechaReporte, usuarioReporte) VALUES
(1, 2, 1, 1, 'Rayon leve en puerta trasera derecha', 70.00, 'Completada', 'Cliente', '2026-05-22 18:00:00', 'admin');
SET IDENTITY_INSERT tb_reparacion OFF;
GO

-- 6.11 Mantenimientos (2) --------------------------------------
-- Auto #3 en taller (correctivo, sin salida aun) + uno finalizado
INSERT INTO tb_mantenimiento (idAuto, fechaIngreso, fechaSalida, tipo, costo, detalle) VALUES
(3, '2026-06-10', NULL,           'Correctivo', 350.00, 'Cambio de pastillas de freno delanteras'),
(1, '2026-04-01', '2026-04-01',   'Preventivo', 120.00, 'Cambio de aceite y filtros programado');
GO

-- 6.12 Historial de Kilometraje (3) ----------------------------
INSERT INTO tb_historial_kilometraje (idAuto, idReserva, kilometrajeAnterior, kilometrajeNuevo, tipoRegistro, usuarioRegistro) VALUES
(1, 1, 45000, 45500, 'Reserva', 'admin'),
(1, 2, 45500, 45800, 'Reserva', 'admin'),
(2, 3, 52300, 52300, 'Reserva', 'admin');
GO

-- 6.13 Configuraciones (3) -------------------------------------
INSERT INTO tb_configuracion (clave, valor, descripcion, tipo) VALUES
('MoraPorHora',        '10.00', 'Penalizacion por cada hora de retraso en la devolucion', 'decimal'),
('TiempoGraciaMinutos', '60',   'Minutos de tolerancia antes de aplicar mora',            'entero'),
('KmRevisionPreventiva', '5000','Cada cuantos kilometros se recomienda mantenimiento preventivo', 'entero');
GO

-- 6.14 Usuarios (2) --------------------------------------------
-- Contrasenas BCrypt:
--   admin123   -> $2a$10$txCV75IDyzhVolXP1WiHxO8yKJz578AtDfaEbTRPLww3RfvIf3D9y
--   cliente123 -> $2a$10$GJKccfi4IMsR1n.Qkim30eLsBURpVGBdo3dsxqs9YxUIhBmgJU/hi

INSERT INTO tb_usuario (Nombre, Correo, Clave, Rol) VALUES
('Admin DRIVO',  'admin@drivo.com',   '$2a$10$txCV75IDyzhVolXP1WiHxO8yKJz578AtDfaEbTRPLww3RfvIf3D9y', 'ADMIN'),
('Carlos Lopez', 'carlos@email.com',  '$2a$10$GJKccfi4IMsR1n.Qkim30eLsBURpVGBdo3dsxqs9YxUIhBmgJU/hi', 'CLIENTE');
GO

-- Vincular cliente Carlos con su usuario
UPDATE tb_cliente SET idUsuario = (SELECT IdUsuario FROM tb_usuario WHERE Correo = 'carlos@email.com') WHERE dni = '11223344';
GO

-- ============================================================
--  FIN DEL SCRIPT
-- ============================================================
PRINT 'Base de datos BD_RentCar creada exitosamente con 14 tablas, catalogo tb_estado y datos semilla (max 3 por tabla).';
GO

-- ============================================================
--  STORED PROCEDURES - ALQUILER AUTO (BD_RentCar)
--  Motor: SQL Server  |  Proyecto: EFSRT - AlquilerAuto
--  Fecha: 19/06/2026  |  Ejecutar despues de DRIVO_BD.sql
--  Estados: FK a tb_estado (RESERVA/AUTO/CLIENTE/REPARACION)
-- ============================================================
USE BD_RentCar;
GO

-- ============================================================
--  Estados frecuentes (variables para reutilizar)
-- ============================================================
DECLARE @E_RESERVA_PENDIENTE   INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'RESERVA_PENDIENTE');
DECLARE @E_RESERVA_CONFIRMADA  INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'RESERVA_CONFIRMADA');
DECLARE @E_RESERVA_CANCELADA   INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'RESERVA_CANCELADA');
DECLARE @E_RESERVA_EXPIRADA    INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'RESERVA_EXPIRADA');
DECLARE @E_ALQUILER_EN_CURSO   INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_EN_CURSO');
DECLARE @E_ALQUILER_EN_DEMORA  INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_EN_DEMORA');
DECLARE @E_ALQUILER_ENTREGADO  INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_ENTREGADO');
DECLARE @E_ALQUILER_FINALIZADO INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_FINALIZADO');
GO

-- ============================================================
--  5.1 Listar autos disponibles
-- ============================================================
IF OBJECT_ID('dbo.sp_Auto_ListarDisponibles', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Auto_ListarDisponibles;
GO

CREATE PROCEDURE dbo.sp_Auto_ListarDisponibles
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        a.idAuto,
        a.placa,
        m.nombre        AS marca,
        mo.nombre       AS modelo,
        mo.categoria,
        a.anio,
        a.color,
        a.kilometrajeActual,
        a.precioPorDia,
        a.precioPorHora,
        a.moraPorDia,
        a.proximaRevisionKm
    FROM tb_auto a
    INNER JOIN tb_marca  m  ON a.idMarca  = m.idMarca
    INNER JOIN tb_modelo mo ON a.idModelo = mo.idModelo
    WHERE a.activo = 1
      AND a.estado  = 'Disponible'
      AND m.activo  = 1
      AND mo.activo = 1
    ORDER BY m.nombre, mo.nombre;
END;
GO

-- ============================================================
--  5.2 Crear reserva (nace como ALQUILER_EN_CURSO)
-- ============================================================
IF OBJECT_ID('dbo.sp_Reserva_Crear', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Reserva_Crear;
GO

CREATE PROCEDURE dbo.sp_Reserva_Crear
    @idCliente   INT,
    @idAuto      INT,
    @fechaInicio DATE,
    @horaInicio  TIME,
    @fechaFin    DATE,
    @horaFin     TIME,
    @subtotal    DECIMAL(10,2),
    @total       DECIMAL(10,2),
    @usuario     VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @idEstadoEnCurso INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_EN_CURSO');

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO tb_reserva (
            idCliente, idAuto, id_estado, fechaInicio, horaInicio, fechaFin, horaFin,
            subtotal, total, usuarioCreacion, fechaHoraInicioReal, kilometrajeInicio
        )
        SELECT
            @idCliente, @idAuto, @idEstadoEnCurso,
            @fechaInicio, @horaInicio, @fechaFin, @horaFin,
            @subtotal, @total, @usuario, GETDATE(), a.kilometrajeActual
        FROM tb_auto a
        WHERE a.idAuto = @idAuto;

        UPDATE tb_auto
        SET estado = 'En proceso'
        WHERE idAuto = @idAuto;

        UPDATE tb_cliente
        SET numeroReservas = numeroReservas + 1
        WHERE idCliente = @idCliente;

        COMMIT TRANSACTION;
        SELECT SCOPE_IDENTITY() AS idReserva, 1 AS Exitoso, 'Reserva creada exitosamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SELECT 0 AS idReserva, 0 AS Exitoso, ERROR_MESSAGE() AS Mensaje;
    END CATCH;
END;
GO

-- ============================================================
--  5.3 Finalizar reserva (→ ALQUILER_FINALIZADO)
-- ============================================================
IF OBJECT_ID('dbo.sp_Reserva_Finalizar', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Reserva_Finalizar;
GO

CREATE PROCEDURE dbo.sp_Reserva_Finalizar
    @idReserva      INT,
    @kilometrajeFin INT,
    @estadoEntrega  VARCHAR(30),
    @observaciones  VARCHAR(500),
    @usuario        VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @idEstadoFinalizado INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_FINALIZADO');

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @idAuto             INT;
        DECLARE @kilometrajeInicio  INT;

        SELECT @idAuto = idAuto, @kilometrajeInicio = kilometrajeInicio
        FROM tb_reserva
        WHERE idReserva = @idReserva;

        IF @idAuto IS NULL
        BEGIN
            ROLLBACK TRANSACTION;
            SELECT 0 AS Exitoso, 'Reserva no encontrada' AS Mensaje;
            RETURN;
        END

        UPDATE tb_reserva
        SET id_estado            = @idEstadoFinalizado,
            estadoEntrega        = @estadoEntrega,
            kilometrajeFin       = @kilometrajeFin,
            observacionesEntrega = @observaciones,
            fechaHoraFinReal     = GETDATE(),
            fechaFinalizacion    = GETDATE(),
            usuarioFinalizacion  = @usuario
        WHERE idReserva = @idReserva;

        IF @kilometrajeInicio IS NOT NULL
        BEGIN
            INSERT INTO tb_historial_kilometraje (
                idAuto, idReserva, kilometrajeAnterior, kilometrajeNuevo, tipoRegistro, usuarioRegistro
            )
            VALUES (
                @idAuto, @idReserva, @kilometrajeInicio, @kilometrajeFin, 'Reserva', @usuario
            );
        END

        COMMIT TRANSACTION;
        SELECT 1 AS Exitoso, 'Reserva finalizada exitosamente' AS Mensaje;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SELECT 0 AS Exitoso, ERROR_MESSAGE() AS Mensaje;
    END CATCH;
END;
GO

-- ============================================================
--  5.4 Dashboard: resumen general
-- ============================================================
IF OBJECT_ID('dbo.sp_Dashboard_Resumen', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Dashboard_Resumen;
GO

CREATE PROCEDURE dbo.sp_Dashboard_Resumen
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @idEnCurso    INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_EN_CURSO');
    DECLARE @idFinalizado INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_FINALIZADO');

    SELECT
        (SELECT COUNT(*)   FROM tb_auto    WHERE activo = 1)                                                                                          AS TotalAutos,
        (SELECT COUNT(*)   FROM tb_auto    WHERE activo = 1 AND estado = 'Disponible')                                                                 AS AutosDisponibles,
        (SELECT COUNT(*)   FROM tb_auto    WHERE activo = 1 AND estado = 'En proceso')                                                                 AS AutosAlquilados,
        (SELECT COUNT(*)   FROM tb_auto    WHERE activo = 1 AND estado = 'En reparacion')                                                              AS AutosMantenimiento,
        (SELECT COUNT(*)   FROM tb_cliente WHERE activo = 1)                                                                                           AS TotalClientes,
        (SELECT COUNT(*)   FROM tb_cliente WHERE activo = 1 AND bloqueado = 0 AND estado = 'activo')                                                   AS ClientesActivos,
        (SELECT COUNT(*)   FROM tb_reserva WHERE id_estado = @idEnCurso)                                                                               AS ReservasActivas,
        (SELECT COUNT(*)   FROM tb_reserva WHERE CAST(fechaCreacion AS DATE) = CAST(GETDATE() AS DATE))                                                AS ReservasHoy,
        (SELECT ISNULL(SUM(total), 0) FROM tb_reserva WHERE id_estado = @idFinalizado
            AND MONTH(fechaFinalizacion) = MONTH(GETDATE())
            AND YEAR(fechaFinalizacion)  = YEAR(GETDATE()))                                                                                            AS IngresosMes;
END;
GO

-- ============================================================
--  5.5 Reporte Financiero
-- ============================================================
IF OBJECT_ID('dbo.sp_Reporte_Financiero', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Reporte_Financiero;
GO

CREATE PROCEDURE dbo.sp_Reporte_Financiero
    @fechaInicio DATE,
    @fechaFin    DATE
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        r.idReserva,
        c.nombre + ' ' + c.apellidoPaterno          AS cliente,
        a.placa,
        r.fechaInicio,
        r.fechaFin,
        r.subtotal,
        r.mora,
        r.costoReparaciones,
        r.total,
        e.codigo                                    AS estado,
        ISNULL(p.montoTotalPagado, 0)               AS totalPagado,
        ISNULL(p.metodoPago, 'Sin pago')            AS metodoPago,
        r.fechaFinalizacion
    FROM tb_reserva r
    INNER JOIN tb_cliente c ON r.idCliente = c.idCliente
    INNER JOIN tb_auto    a ON r.idAuto    = a.idAuto
    INNER JOIN tb_estado  e ON r.id_estado = e.id_estado
    LEFT  JOIN tb_pago    p ON r.idReserva = p.idReserva
    WHERE r.fechaInicio >= @fechaInicio
      AND r.fechaFin    <= @fechaFin
    ORDER BY r.fechaCreacion DESC;
END;
GO

-- ============================================================
--  5.6 Reporte Operativo
-- ============================================================
IF OBJECT_ID('dbo.sp_Reporte_Operativo', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Reporte_Operativo;
GO

CREATE PROCEDURE dbo.sp_Reporte_Operativo
    @fechaInicio DATE,
    @fechaFin    DATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @idFinalizado INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_FINALIZADO');

    SELECT
        a.idAuto,
        a.placa,
        m.nombre            AS marca,
        mo.nombre           AS modelo,
        COUNT(r.idReserva)  AS totalReservas,
        ISNULL(SUM(r.total), 0)         AS ingresosGenerados,
        ISNULL(SUM(hk.diferencia), 0)   AS kmTotalesRecorridos
    FROM tb_auto a
    INNER JOIN tb_marca  m  ON a.idMarca  = m.idMarca
    INNER JOIN tb_modelo mo ON a.idModelo = mo.idModelo
    LEFT  JOIN tb_reserva r ON a.idAuto   = r.idAuto
        AND r.id_estado   = @idFinalizado
        AND r.fechaInicio >= @fechaInicio
        AND r.fechaFin    <= @fechaFin
    LEFT  JOIN tb_historial_kilometraje hk ON r.idReserva = hk.idReserva
    WHERE a.activo = 1
    GROUP BY a.idAuto, a.placa, m.nombre, mo.nombre
    ORDER BY totalReservas DESC;
END;
GO

-- ============================================================
--  5.7 Reporte de Clientes
-- ============================================================
IF OBJECT_ID('dbo.sp_Reporte_Clientes', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Reporte_Clientes;
GO

CREATE PROCEDURE dbo.sp_Reporte_Clientes
    @fechaInicio DATE = NULL,
    @fechaFin    DATE = NULL,
    @idCliente   INT  = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @idFinalizado INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_FINALIZADO');

    SELECT
        c.idCliente,
        c.nombre + ' ' + c.apellidoPaterno + ISNULL(' ' + c.apellidoMaterno, '') AS nombreCompleto,
        c.dni,
        c.telefono,
        c.email,
        c.numeroReservas,
        c.numeroIncidentes,
        c.bloqueado,
        c.estado,
        l.numeroLicencia,
        l.categoria         AS categoriaLicencia,
        l.fechaVencimiento,
        CASE
            WHEN l.fechaVencimiento < CAST(GETDATE() AS DATE) THEN 'VENCIDA'
            ELSE 'Vigente'
        END                 AS estadoLicencia,
        ISNULL(pagos.totalPagado, 0)        AS totalPagadoHistorico,
        ultima.fechaUltimaReserva
    FROM tb_cliente c
    LEFT JOIN tb_licencia l ON c.idLicencia = l.idLicencia
    LEFT JOIN (
        SELECT r.idCliente, SUM(p.montoTotalPagado) AS totalPagado
        FROM tb_reserva r
        INNER JOIN tb_pago p ON r.idReserva = p.idReserva
        WHERE r.id_estado = @idFinalizado
        GROUP BY r.idCliente
    ) pagos  ON c.idCliente = pagos.idCliente
    LEFT JOIN (
        SELECT idCliente, MAX(fechaCreacion) AS fechaUltimaReserva
        FROM tb_reserva
        GROUP BY idCliente
    ) ultima ON c.idCliente = ultima.idCliente
    WHERE c.activo = 1
      AND (@idCliente IS NULL OR c.idCliente = @idCliente)
    ORDER BY c.numeroReservas DESC, c.numeroIncidentes DESC;
END;
GO

-- ============================================================
--  5.8 Verificar disponibilidad de auto en rango de fechas
-- ============================================================
IF OBJECT_ID('dbo.sp_Auto_VerificarDisponibilidad', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Auto_VerificarDisponibilidad;
GO

CREATE PROCEDURE dbo.sp_Auto_VerificarDisponibilidad
    @idAuto           INT,
    @fechaInicio      DATE,
    @fechaFin         DATE,
    @idReservaExcluir INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @idEnCurso INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_EN_CURSO');

    DECLARE @estadoAuto VARCHAR(20);
    SELECT @estadoAuto = estado FROM tb_auto WHERE idAuto = @idAuto;

    IF @estadoAuto IS NULL
    BEGIN
        SELECT 0 AS disponible, 'Auto no encontrado' AS mensaje;
        RETURN;
    END

    IF @estadoAuto != 'Disponible'
    BEGIN
        SELECT 0 AS disponible, 'El auto no esta disponible (estado: ' + @estadoAuto + ')' AS mensaje;
        RETURN;
    END

    IF EXISTS (
        SELECT 1 FROM tb_reserva
        WHERE idAuto   = @idAuto
          AND id_estado = @idEnCurso
          AND (@idReservaExcluir IS NULL OR idReserva != @idReservaExcluir)
          AND fechaInicio <= @fechaFin
          AND fechaFin   >= @fechaInicio
    )
    BEGIN
        SELECT 0 AS disponible, 'El auto ya tiene una reserva en ese rango de fechas' AS mensaje;
        RETURN;
    END

    SELECT 1 AS disponible, 'Auto disponible' AS mensaje;
END;
GO

-- ============================================================
--  5.9 Reporte Operativo Completo
-- ============================================================
IF OBJECT_ID('dbo.sp_Reporte_Operativo_Completo', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Reporte_Operativo_Completo;
GO

CREATE PROCEDURE dbo.sp_Reporte_Operativo_Completo
    @fechaInicio DATE,
    @fechaFin    DATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @idFinalizado INT = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_FINALIZADO');

    -- Resultado 1: Ranking de autos por reservas
    SELECT
        'RANKING_AUTOS'         AS tipo_reporte,
        a.idAuto,
        a.placa,
        m.nombre                AS marca,
        mo.nombre               AS modelo,
        a.estado,
        COUNT(r.idReserva)      AS totalReservas,
        ISNULL(SUM(r.total), 0)         AS ingresosGenerados,
        ISNULL(SUM(hk.diferencia), 0)   AS kmTotalesRecorridos
    FROM tb_auto a
    INNER JOIN tb_marca  m  ON a.idMarca  = m.idMarca
    INNER JOIN tb_modelo mo ON a.idModelo = mo.idModelo
    LEFT  JOIN tb_reserva r ON a.idAuto   = r.idAuto
        AND r.id_estado   = @idFinalizado
        AND r.fechaInicio >= @fechaInicio
        AND r.fechaFin    <= @fechaFin
    LEFT  JOIN tb_historial_kilometraje hk ON r.idReserva = hk.idReserva
    WHERE a.activo = 1
    GROUP BY a.idAuto, a.placa, m.nombre, mo.nombre, a.estado
    ORDER BY totalReservas DESC;

    -- Resultado 2: Mantenimientos en el periodo
    SELECT
        'MANTENIMIENTOS'        AS tipo_reporte,
        mt.idMantenimiento,
        a.placa,
        m.nombre                AS marca,
        mo.nombre               AS modelo,
        mt.tipo,
        mt.fechaIngreso,
        mt.fechaSalida,
        mt.costo,
        mt.detalle
    FROM tb_mantenimiento mt
    INNER JOIN tb_auto    a  ON mt.idAuto  = a.idAuto
    INNER JOIN tb_marca   m  ON a.idMarca  = m.idMarca
    INNER JOIN tb_modelo  mo ON a.idModelo = mo.idModelo
    WHERE mt.fechaIngreso >= @fechaInicio
      AND (mt.fechaSalida IS NULL OR mt.fechaSalida <= @fechaFin)
    ORDER BY mt.fechaIngreso DESC;

    -- Resultado 3: Reparaciones en el periodo
    SELECT
        'REPARACIONES'          AS tipo_reporte,
        rp.idReparacion,
        a.placa,
        rp.descripcion,
        rp.costo,
        rp.estado,
        rp.responsable,
        rp.fechaReporte,
        rp.fechaInicio,
        rp.fechaFin
    FROM tb_reparacion rp
    INNER JOIN tb_auto a ON rp.idAuto = a.idAuto
    WHERE rp.fechaReporte >= @fechaInicio
      AND rp.fechaReporte <= @fechaFin
    ORDER BY rp.fechaReporte DESC;
END;
GO

-- ============================================================
--  VERIFICACION FINAL
-- ============================================================
SELECT name AS procedimiento, create_date, modify_date
FROM sys.procedures
ORDER BY name;
GO

PRINT 'Stored procedures actualizados para FK tb_estado.';
GO

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

