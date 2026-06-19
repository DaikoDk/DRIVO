-- ============================================================
--  CREACION DE BASE DE DATOS - ALQUILER AUTO (BD_RentCar)
--  Motor: SQL Server  |  Proyecto: EFSRT - AlquilerAuto
--  Fecha: 18/06/2026  |  Flujo: auto-inicio (reserva nace En proceso)
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
    CONSTRAINT CK_Modelo_Categoria CHECK (categoria IN ('Sedán','SUV','Hatchback','Pickup','Deportivo','Van','Coupé','Convertible')),
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

-- 2.6 tb_reserva -----------------------------------------------
CREATE TABLE tb_reserva (
    idReserva               INT IDENTITY(1,1)   NOT NULL,
    idCliente               INT                 NOT NULL,
    idAuto                  INT                 NOT NULL,
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
    estado                  VARCHAR(20)         NOT NULL DEFAULT 'En proceso',
    estadoEntrega           VARCHAR(30)         NOT NULL DEFAULT 'Sin entregar',
    observacionesEntrega    VARCHAR(500),
    fechaHoraInicioReal     DATETIME,
    fechaHoraFinReal        DATETIME,
    fechaCreacion           DATETIME            NOT NULL DEFAULT GETDATE(),
    usuarioCreacion         VARCHAR(100),
    fechaFinalizacion       DATETIME,
    usuarioFinalizacion     VARCHAR(100),
    CONSTRAINT PK_Reserva PRIMARY KEY CLUSTERED (idReserva),
    CONSTRAINT FK_Reserva_Cliente FOREIGN KEY (idCliente) REFERENCES tb_cliente(idCliente),
    CONSTRAINT FK_Reserva_Auto FOREIGN KEY (idAuto) REFERENCES tb_auto(idAuto),
    CONSTRAINT CK_Reserva_Fechas CHECK (fechaFin >= fechaInicio),
    CONSTRAINT CK_Reserva_Subtotal CHECK (subtotal >= 0),
    CONSTRAINT CK_Reserva_Mora CHECK (mora >= 0),
    CONSTRAINT CK_Reserva_CostoRep CHECK (costoReparaciones >= 0),
    CONSTRAINT CK_Reserva_Total CHECK (total >= 0),
    CONSTRAINT CK_Reserva_Estado CHECK (estado IN ('Pendiente','Confirmada','En proceso','Finalizada','Cancelada')),
    CONSTRAINT CK_Reserva_EstadoEntrega CHECK (estadoEntrega IN ('Sin entregar','Entregado OK','Entregado con daños','Entregado con retraso'))
);
GO

-- 2.7 tb_pago --------------------------------------------------
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

-- 2.8 tb_catalogo_reparacion -----------------------------------
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

-- 2.9 tb_reparacion --------------------------------------------
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

-- 2.10 tb_mantenimiento ----------------------------------------
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

-- 2.11 tb_historial_kilometraje --------------------------------
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

-- 2.12 tb_configuracion ----------------------------------------
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
CREATE INDEX IX_Reserva_Cliente ON tb_reserva(idCliente, estado);
CREATE INDEX IX_Reserva_Auto    ON tb_reserva(idAuto, estado);
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

    -- Actualizar kilometraje del auto cuando se finaliza
        IF UPDATE(estado) AND EXISTS (SELECT 1 FROM inserted WHERE estado = 'Finalizada' AND kilometrajeFin IS NOT NULL)
    BEGIN
        UPDATE tb_auto
        SET kilometrajeActual = i.kilometrajeFin
        FROM tb_auto a
        INNER JOIN inserted i ON a.idAuto = i.idAuto
        WHERE i.estado = 'Finalizada' AND i.kilometrajeFin IS NOT NULL;
    END
END;
GO

-- ============================================================
--  SECCION 5: DATOS SEMILLA (maximo 3 por tabla)
-- ============================================================

-- 6.1 Marcas (3) -----------------------------------------------
SET IDENTITY_INSERT tb_marca ON;
INSERT INTO tb_marca (idMarca, nombre, paisOrigen) VALUES
(1, 'Toyota', 'Japón'),
(2, 'Hyundai', 'Corea del Sur'),
(3, 'Kia', 'Corea del Sur');
SET IDENTITY_INSERT tb_marca OFF;
GO

-- 6.2 Modelos (3) ----------------------------------------------
SET IDENTITY_INSERT tb_modelo ON;
INSERT INTO tb_modelo (idModelo, idMarca, nombre, categoria, numeroPasajeros) VALUES
(1, 1, 'Yaris', 'Sedán', 5),
(2, 2, 'Accent', 'Sedán', 5),
(3, 3, 'Rio', 'Hatchback', 5);
SET IDENTITY_INSERT tb_modelo OFF;
GO

-- 6.3 Autos (3) ------------------------------------------------
-- Disponible: listo para alquilar
-- En proceso: actualmente alquilado (reserva activa)
-- En reparación: en taller
SET IDENTITY_INSERT tb_auto ON;
INSERT INTO tb_auto (idAuto, placa, idMarca, idModelo, anio, color, kilometrajeActual, ultimaRevisionKm, proximaRevisionKm, precioPorDia, precioPorHora, moraPorDia, estado) VALUES
(1, 'ABC-123', 1, 1, 2020, 'Blanco', 45500, 40000, 50000, 120.00, 15.00, 30.00, 'Disponible'),
(2, 'DEF-456', 2, 2, 2019, 'Negro',  52300, 48000, 58000, 110.00, 13.00, 25.00, 'En proceso'),
(3, 'GHI-789', 3, 3, 2021, 'Rojo',   38000, 35000, 40000, 130.00, 16.00, 30.00, 'En reparación');
SET IDENTITY_INSERT tb_auto OFF;
GO

-- 6.4 Licencias (3) --------------------------------------------
SET IDENTITY_INSERT tb_licencia ON;
INSERT INTO tb_licencia (idLicencia, numeroLicencia, categoria, fechaVencimiento) VALUES
(1, 'Q12345678', 'A-IIa', '2027-06-15'),
(2, 'Q87654321', 'A-IIa', '2027-12-20'),
(3, 'Q11223344', 'A-I',   '2028-03-10');
SET IDENTITY_INSERT tb_licencia OFF;
GO

-- 6.5 Clientes (3) ---------------------------------------------
SET IDENTITY_INSERT tb_cliente ON;
INSERT INTO tb_cliente (idCliente, nombre, apellidoPaterno, apellidoMaterno, dni, telefono, email, direccion, idLicencia, numeroReservas, estado) VALUES
(1, 'Juan',   'Pérez',  'García',  '12345678', '987654321', 'juanperez@example.com',   'Av. Los Olivos 123, Lima',   1, 1, 'activo'),
(2, 'María',  'López',  'Flores',  '87654321', '912345678', 'marialopez@example.com',  'Jr. Las Palmeras 456, Lima', 2, 1, 'activo'),
(3, 'Carlos', 'Gómez',  'Ríos',    '11223344', '999555444', 'carlosgomez@example.com', 'Calle Real 789, Callao',     3, 1, 'activo');
SET IDENTITY_INSERT tb_cliente OFF;
GO

-- 6.6 Reservas (3) ---------------------------------------------
-- #1: Finalizada OK (cliente María, auto Yaris)
-- #2: Finalizada con daños (cliente Carlos, auto Yaris)
-- #3: En proceso - activa (cliente Juan, auto Accent, cruza fecha actual)
SET IDENTITY_INSERT tb_reserva ON;
INSERT INTO tb_reserva (idReserva, idCliente, idAuto, fechaInicio, horaInicio, fechaFin, horaFin, kilometrajeInicio, subtotal, total, estado, estadoEntrega, fechaCreacion, usuarioCreacion, fechaHoraInicioReal, fechaFinalizacion, usuarioFinalizacion) VALUES
(1, 2, 1, '2026-05-10', '09:00', '2026-05-12', '18:00', 45000, 360.00, 360.00, 'Finalizada', 'Entregado OK',     '2026-05-08 10:30:00', 'admin', '2026-05-10 09:00:00', '2026-05-12 17:45:00', 'admin'),
(2, 3, 1, '2026-05-20', '08:00', '2026-05-22', '20:00', 45500, 450.00, 520.00, 'Finalizada', 'Entregado con daños', '2026-05-18 14:00:00', 'admin', '2026-05-20 08:00:00', '2026-05-22 18:00:00', 'admin'),
(3, 1, 2, '2026-06-15', '10:00', '2026-06-20', '16:00', 52300, 660.00, 660.00, 'En proceso', 'Sin entregar',       '2026-06-14 09:00:00', 'admin', '2026-06-15 10:00:00', NULL, NULL);
SET IDENTITY_INSERT tb_reserva OFF;
GO

-- Actualizar kilometrajeFin de las finalizadas
UPDATE tb_reserva SET kilometrajeFin = 45500, fechaHoraFinReal = '2026-05-12 17:45:00' WHERE idReserva = 1;
UPDATE tb_reserva SET kilometrajeFin = 45800, fechaHoraFinReal = '2026-05-22 18:00:00', costoReparaciones = 70.00, observacionesEntrega = 'Rayón leve en puerta trasera' WHERE idReserva = 2;
GO

-- 6.7 Pagos (2) ------------------------------------------------
SET IDENTITY_INSERT tb_pago ON;
INSERT INTO tb_pago (idPago, idReserva, montoBase, montoMora, montoDanos, montoTotalPagado, fechaPago, metodoPago) VALUES
(1, 1, 360.00, 0,    0,     360.00, '2026-05-12 17:50:00', 'Tarjeta'),
(2, 2, 450.00, 0,    70.00, 520.00, '2026-05-22 18:10:00', 'Efectivo');
SET IDENTITY_INSERT tb_pago OFF;
GO

-- 6.8 Catálogo de Reparaciones (3) -----------------------------
SET IDENTITY_INSERT tb_catalogo_reparacion ON;
INSERT INTO tb_catalogo_reparacion (idCatalogoReparacion, descripcion, costoEstimado, tiempoEstimadoHoras) VALUES
(1, 'Rayón de pintura', 200.00, 4),
(2, 'Abolladura de carrocería', 500.00, 8),
(3, 'Rotura de espejo lateral', 150.00, 2);
SET IDENTITY_INSERT tb_catalogo_reparacion OFF;
GO

-- 6.9 Reparaciones (1) -----------------------------------------
SET IDENTITY_INSERT tb_reparacion ON;
INSERT INTO tb_reparacion (idReparacion, idReserva, idAuto, idCatalogoReparacion, descripcion, costo, estado, responsable, fechaReporte, usuarioReporte) VALUES
(1, 2, 1, 1, 'Rayón leve en puerta trasera derecha', 70.00, 'Completada', 'Cliente', '2026-05-22 18:00:00', 'admin');
SET IDENTITY_INSERT tb_reparacion OFF;
GO

-- 6.10 Mantenimientos (2) --------------------------------------
-- Auto #3 en taller (correctivo, sin salida aún) + uno finalizado
INSERT INTO tb_mantenimiento (idAuto, fechaIngreso, fechaSalida, tipo, costo, detalle) VALUES
(3, '2026-06-10', NULL,           'Correctivo', 350.00, 'Cambio de pastillas de freno delanteras'),
(1, '2026-04-01', '2026-04-01',   'Preventivo', 120.00, 'Cambio de aceite y filtros programado');
GO

-- 6.11 Historial de Kilometraje (3) ----------------------------
INSERT INTO tb_historial_kilometraje (idAuto, idReserva, kilometrajeAnterior, kilometrajeNuevo, tipoRegistro, usuarioRegistro) VALUES
(1, 1, 45000, 45500, 'Reserva', 'admin'),
(1, 2, 45500, 45800, 'Reserva', 'admin'),
(2, 3, 52300, 52300, 'Reserva', 'admin');
GO

-- 6.12 Configuraciones (3) -------------------------------------
INSERT INTO tb_configuracion (clave, valor, descripcion, tipo) VALUES
('MoraPorHora',        '10.00', 'Penalización por cada hora de retraso en la devolución', 'decimal'),
('TiempoGraciaMinutos', '60',   'Minutos de tolerancia antes de aplicar mora',            'entero'),
('KmRevisionPreventiva', '5000','Cada cuántos kilómetros se recomienda mantenimiento preventivo', 'entero');
GO

-- 6.13 Usuarios (2) --------------------------------------------
-- Contraseñas BCrypt:
--   admin123   -> $2a$10$txCV75IDyzhVolXP1WiHxO8yKJz578AtDfaEbTRPLww3RfvIf3D9y
--   cliente123 -> $2a$10$GJKccfi4IMsR1n.Qkim30eLsBURpVGBdo3dsxqs9YxUIhBmgJU/hi

INSERT INTO tb_usuario (Nombre, Correo, Clave, Rol) VALUES
('Admin DRIVO',  'admin@drivo.com',   '$2a$10$txCV75IDyzhVolXP1WiHxO8yKJz578AtDfaEbTRPLww3RfvIf3D9y', 'ADMIN'),
('Carlos López', 'carlos@email.com',  '$2a$10$GJKccfi4IMsR1n.Qkim30eLsBURpVGBdo3dsxqs9YxUIhBmgJU/hi', 'CLIENTE');
GO

-- Vincular cliente Carlos con su usuario
UPDATE tb_cliente SET idUsuario = (SELECT IdUsuario FROM tb_usuario WHERE Correo = 'carlos@email.com') WHERE dni = '11223344';
GO

-- ============================================================
--  SECCION 6: VISTAS PARA REPORTES
-- ============================================================

-- Vista: Autos con información completa
CREATE OR ALTER VIEW vw_Auto_Completo AS
SELECT
    a.idAuto, a.placa, m.nombre AS marca, mo.nombre AS modelo, mo.categoria,
    a.anio, a.color, a.numeroMotor, a.numeroChasis,
    a.kilometrajeActual, a.ultimaRevisionKm, a.proximaRevisionKm,
    a.precioPorDia, a.precioPorHora, a.moraPorDia, a.estado, a.activo
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
    r.estado, r.estadoEntrega,
    r.fechaHoraInicioReal, r.fechaHoraFinReal,
    r.fechaCreacion, r.usuarioCreacion
FROM tb_reserva r
INNER JOIN tb_cliente c ON r.idCliente = c.idCliente
INNER JOIN tb_auto a ON r.idAuto = a.idAuto
INNER JOIN tb_marca m ON a.idMarca = m.idMarca
INNER JOIN tb_modelo mo ON a.idModelo = mo.idModelo;
GO

-- Vista: Reporte de ingresos por período
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
WHERE r.estado = 'Finalizada'
GROUP BY YEAR(r.fechaFinalizacion), MONTH(r.fechaFinalizacion);
GO

-- ============================================================
--  FIN DEL SCRIPT
-- ============================================================
PRINT 'Base de datos BD_RentCar creada exitosamente con 13 tablas y datos semilla (max 3 por tabla).';
GO
