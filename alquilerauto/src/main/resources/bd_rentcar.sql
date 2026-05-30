-- ============================================================
--  CREACION DE BASE DE DATOS - ALQUILER AUTO (BD_RentCar)
--  Motor: SQL Server
--  Proyecto: EFSRT - AlquilerAuto
--  Fecha:   25/05/2026
-- ============================================================

-- CREAR BASE DE DATOS (elimina version anterior si existe)
USE master;
go

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'BD_RentCar')
BEGIN
    ALTER DATABASE BD_RentCar SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE BD_RentCar;
END
GO

CREATE DATABASE BD_RentCar;
GO

USE BD_RentCar;
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

-- 2.5 tb_cliente -----------------------------------------------
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
                            estado                  VARCHAR(20)         NOT NULL DEFAULT 'Pendiente',
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

-- 2.13 tb_usuario ----------------------------------------------
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

-- Marcar auto como Disponible
UPDATE tb_auto
SET estado = 'Disponible'
    FROM tb_auto a
        INNER JOIN inserted i ON a.idAuto = i.idAuto
WHERE i.estado = 'Finalizada' AND a.estado = 'En proceso';
END
END;
GO

-- ============================================================
--  SECCION 5: STORED PROCEDURES
-- ============================================================

-- 5.1 Listar autos disponibles ---------------------------------
CREATE OR ALTER PROCEDURE sp_Auto_ListarDisponibles
    AS
BEGIN
    SET NOCOUNT ON;
SELECT
    a.idAuto, a.placa, m.nombre AS marca, mo.nombre AS modelo,
    a.anio, a.color, a.kilometrajeActual, a.precioPorDia, a.precioPorHora, a.moraPorDia
FROM tb_auto a
         INNER JOIN tb_marca m ON a.idMarca = m.idMarca
         INNER JOIN tb_modelo mo ON a.idModelo = mo.idModelo
WHERE a.activo = 1 AND a.estado = 'Disponible'
ORDER BY m.nombre, mo.nombre;
END;
GO

-- 5.2 Crear reserva --------------------------------------------
CREATE OR ALTER PROCEDURE sp_Reserva_Crear
    @idCliente INT, @idAuto INT, @fechaInicio DATE, @horaInicio TIME,
    @fechaFin DATE, @horaFin TIME, @subtotal DECIMAL(10,2), @total DECIMAL(10,2),
    @usuario VARCHAR(100)
    AS
BEGIN
    SET NOCOUNT ON;
BEGIN TRY
BEGIN TRANSACTION;

INSERT INTO tb_reserva (idCliente, idAuto, fechaInicio, horaInicio, fechaFin, horaFin,
                        subtotal, total, usuarioCreacion, estado)
VALUES (@idCliente, @idAuto, @fechaInicio, @horaInicio, @fechaFin, @horaFin,
        @subtotal, @total, @usuario, 'Confirmada');

UPDATE tb_auto SET estado = 'Reservado' WHERE idAuto = @idAuto;
UPDATE tb_cliente SET numeroReservas = numeroReservas + 1 WHERE idCliente = @idCliente;

COMMIT TRANSACTION;
SELECT SCOPE_IDENTITY() AS idReserva, 1 AS Exitoso, 'Reserva creada exitosamente' AS Mensaje;
END TRY
BEGIN CATCH
ROLLBACK TRANSACTION;
SELECT 0 AS idReserva, 0 AS Exitoso, ERROR_MESSAGE() AS Mensaje;
END CATCH;
END;
GO

-- 5.3 Finalizar reserva ----------------------------------------
CREATE OR ALTER PROCEDURE sp_Reserva_Finalizar
    @idReserva INT, @kilometrajeFin INT, @estadoEntrega VARCHAR(30),
    @observaciones VARCHAR(500), @usuario VARCHAR(100)
    AS
BEGIN
    SET NOCOUNT ON;
BEGIN TRY
BEGIN TRANSACTION;

        DECLARE @idAuto INT, @kilometrajeInicio INT;

SELECT @idAuto = idAuto, @kilometrajeInicio = kilometrajeInicio
FROM tb_reserva WHERE idReserva = @idReserva;

IF @idAuto IS NULL
BEGIN
ROLLBACK TRANSACTION;
SELECT 0 AS Exitoso, 'Reserva no encontrada' AS Mensaje;
RETURN;
END

UPDATE tb_reserva
SET estado = 'Finalizada', estadoEntrega = @estadoEntrega,
    kilometrajeFin = @kilometrajeFin,
    observacionesEntrega = @observaciones,
    fechaHoraFinReal = GETDATE(),
    fechaFinalizacion = GETDATE(),
    usuarioFinalizacion = @usuario
WHERE idReserva = @idReserva;

-- Registrar en historial de kilometraje
IF @kilometrajeInicio IS NOT NULL
BEGIN
INSERT INTO tb_historial_kilometraje (idAuto, idReserva, kilometrajeAnterior, kilometrajeNuevo, tipoRegistro, usuarioRegistro)
VALUES (@idAuto, @idReserva, @kilometrajeInicio, @kilometrajeFin, 'Reserva', @usuario);
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

-- 5.4 Dashboard: resumen general --------------------------------
CREATE OR ALTER PROCEDURE sp_Dashboard_Resumen
    AS
BEGIN
    SET NOCOUNT ON;
SELECT
    (SELECT COUNT(*) FROM tb_auto WHERE activo = 1) AS TotalAutos,
    (SELECT COUNT(*) FROM tb_auto WHERE activo = 1 AND estado = 'Disponible') AS AutosDisponibles,
    (SELECT COUNT(*) FROM tb_auto WHERE activo = 1 AND estado IN ('Reservado','En proceso')) AS AutosAlquilados,
    (SELECT COUNT(*) FROM tb_auto WHERE activo = 1 AND estado = 'En reparación') AS AutosMantenimiento,
    (SELECT COUNT(*) FROM tb_cliente WHERE activo = 1) AS TotalClientes,
    (SELECT COUNT(*) FROM tb_cliente WHERE activo = 1 AND bloqueado = 0 AND estado = 'activo') AS ClientesActivos,
    (SELECT COUNT(*) FROM tb_reserva WHERE estado IN ('Pendiente','Confirmada','En proceso')) AS ReservasActivas,
    (SELECT COUNT(*) FROM tb_reserva WHERE CAST(fechaCreacion AS DATE) = CAST(GETDATE() AS DATE)) AS ReservasHoy,
    (SELECT ISNULL(SUM(total), 0) FROM tb_reserva WHERE estado = 'Finalizada' AND MONTH(fechaFinalizacion) = MONTH(GETDATE()) AND YEAR(fechaFinalizacion) = YEAR(GETDATE())) AS IngresosMes;
END;
GO

-- 5.5 Reporte Financiero ---------------------------------------
CREATE OR ALTER PROCEDURE sp_Reporte_Financiero
    @fechaInicio DATE, @fechaFin DATE
    AS
BEGIN
    SET NOCOUNT ON;
SELECT
    r.idReserva,
    c.nombre + ' ' + c.apellidoPaterno AS cliente,
    a.placa,
    r.fechaInicio, r.fechaFin,
    r.subtotal, r.mora, r.costoReparaciones, r.total,
    r.estado,
    ISNULL(p.montoTotalPagado, 0) AS totalPagado,
    ISNULL(p.metodoPago, 'Sin pago') AS metodoPago,
    r.fechaFinalizacion
FROM tb_reserva r
         INNER JOIN tb_cliente c ON r.idCliente = c.idCliente
         INNER JOIN tb_auto a ON r.idAuto = a.idAuto
         LEFT JOIN tb_pago p ON r.idReserva = p.idReserva
WHERE r.fechaInicio >= @fechaInicio AND r.fechaFin <= @fechaFin
ORDER BY r.fechaCreacion DESC;
END;
GO

-- 5.6 Reporte Operativo ----------------------------------------
CREATE OR ALTER PROCEDURE sp_Reporte_Operativo
    @fechaInicio DATE, @fechaFin DATE
    AS
BEGIN
    SET NOCOUNT ON;
    -- Autos con más reservas
SELECT
    a.idAuto, a.placa, m.nombre AS marca, mo.nombre AS modelo,
    COUNT(r.idReserva) AS totalReservas,
    ISNULL(SUM(r.total), 0) AS ingresosGenerados,
    ISNULL(SUM(hk.diferencia), 0) AS kmTotalesRecorridos
FROM tb_auto a
         INNER JOIN tb_marca m ON a.idMarca = m.idMarca
         INNER JOIN tb_modelo mo ON a.idModelo = mo.idModelo
         LEFT JOIN tb_reserva r ON a.idAuto = r.idAuto AND r.estado = 'Finalizada'
    AND r.fechaInicio >= @fechaInicio AND r.fechaFin <= @fechaFin
         LEFT JOIN tb_historial_kilometraje hk ON r.idReserva = hk.idReserva
WHERE a.activo = 1
GROUP BY a.idAuto, a.placa, m.nombre, mo.nombre
ORDER BY totalReservas DESC;
END;
GO

-- ============================================================
--  SECCION 5.7: REPORTE DE CLIENTES (NUEVO)
-- ============================================================

-- 5.7 Reporte de Clientes ---------------------------------------
CREATE OR ALTER PROCEDURE sp_Reporte_Clientes
    @fechaInicio DATE = NULL,
    @fechaFin DATE = NULL,
    @idCliente INT = NULL
    AS
BEGIN
    SET NOCOUNT ON;

    -- Clientes frecuentes (top por reservas)
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
    l.categoria AS categoriaLicencia,
    l.fechaVencimiento,
    CASE WHEN l.fechaVencimiento < CAST(GETDATE() AS DATE) THEN 'VENCIDA' ELSE 'Vigente' END AS estadoLicencia,
    ISNULL(pagos.totalPagado, 0) AS totalPagadoHistorico,
    ISNULL(ultima.fechaUltimaReserva, NULL) AS fechaUltimaReserva
FROM tb_cliente c
         LEFT JOIN tb_licencia l ON c.idLicencia = l.idLicencia
         LEFT JOIN (
    SELECT r.idCliente, SUM(p.montoTotalPagado) AS totalPagado
    FROM tb_reserva r
             INNER JOIN tb_pago p ON r.idReserva = p.idReserva
    WHERE r.estado = 'Finalizada'
    GROUP BY r.idCliente
) pagos ON c.idCliente = pagos.idCliente
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
--  SECCION 5.8: VALIDACION DE SOLAPAMIENTO DE RESERVAS (NUEVO)
-- ============================================================

-- 5.8 Verificar disponibilidad de auto en rango de fechas --------
CREATE OR ALTER PROCEDURE sp_Auto_VerificarDisponibilidad
    @idAuto INT,
    @fechaInicio DATE,
    @fechaFin DATE,
    @idReservaExcluir INT = NULL
    AS
BEGIN
    SET NOCOUNT ON;

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
        WHERE idAuto = @idAuto
            AND estado IN ('Pendiente', 'Confirmada', 'En proceso')
            AND (@idReservaExcluir IS NULL OR idReserva != @idReservaExcluir)
            AND fechaInicio <= @fechaFin
            AND fechaFin >= @fechaInicio
    )
BEGIN
SELECT 0 AS disponible, 'El auto ya tiene una reserva en ese rango de fechas' AS mensaje;
RETURN;
END

SELECT 1 AS disponible, 'Auto disponible' AS mensaje;
END;
GO

-- ============================================================
--  SECCION 5.9: REPORTE OPERATIVO AMPLIADO (MEJORADO)
-- ============================================================

-- 5.9 Reporte Operativo Completo ---------------------------------
CREATE OR ALTER PROCEDURE sp_Reporte_Operativo_Completo
    @fechaInicio DATE,
    @fechaFin DATE
    AS
BEGIN
    SET NOCOUNT ON;

    -- Resultado 1: Ranking de autos por reservas
SELECT
    'RANKING_AUTOS' AS tipo_reporte,
    a.idAuto,
    a.placa,
    m.nombre AS marca,
    mo.nombre AS modelo,
    a.estado,
    COUNT(r.idReserva) AS totalReservas,
    ISNULL(SUM(r.total), 0) AS ingresosGenerados,
    ISNULL(SUM(hk.diferencia), 0) AS kmTotalesRecorridos
FROM tb_auto a
         INNER JOIN tb_marca m ON a.idMarca = m.idMarca
         INNER JOIN tb_modelo mo ON a.idModelo = mo.idModelo
         LEFT JOIN tb_reserva r ON a.idAuto = r.idAuto
    AND r.estado = 'Finalizada'
    AND r.fechaInicio >= @fechaInicio
    AND r.fechaFin <= @fechaFin
         LEFT JOIN tb_historial_kilometraje hk ON r.idReserva = hk.idReserva
WHERE a.activo = 1
GROUP BY a.idAuto, a.placa, m.nombre, mo.nombre, a.estado
ORDER BY totalReservas DESC;

-- Resultado 2: Mantenimientos en el periodo
SELECT
    'MANTENIMIENTOS' AS tipo_reporte,
    mt.idMantenimiento,
    a.placa,
    m.nombre AS marca,
    mo.nombre AS modelo,
    mt.tipo,
    mt.fechaIngreso,
    mt.fechaSalida,
    mt.costo,
    mt.detalle
FROM tb_mantenimiento mt
         INNER JOIN tb_auto a ON mt.idAuto = a.idAuto
         INNER JOIN tb_marca m ON a.idMarca = m.idMarca
         INNER JOIN tb_modelo mo ON a.idModelo = mo.idModelo
WHERE mt.fechaIngreso >= @fechaInicio
  AND (mt.fechaSalida IS NULL OR mt.fechaSalida <= @fechaFin)
ORDER BY mt.fechaIngreso DESC;

-- Resultado 3: Reparaciones en el periodo
SELECT
    'REPARACIONES' AS tipo_reporte,
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
--  SECCION 6: DATOS SEMILLA (SEED DATA)
-- ============================================================

-- 6.1 Marcas ---------------------------------------------------
SET IDENTITY_INSERT tb_marca ON;
INSERT INTO tb_marca (idMarca, nombre, paisOrigen) VALUES
                                                       (1, 'Toyota', 'Japón'),
                                                       (2, 'Hyundai', 'Corea del Sur'),
                                                       (3, 'Kia', 'Corea del Sur'),
                                                       (4, 'Nissan', 'Japón'),
                                                       (5, 'Mazda', 'Japón'),
                                                       (6, 'Chevrolet', 'Estados Unidos'),
                                                       (7, 'Ford', 'Estados Unidos'),
                                                       (8, 'Honda', 'Japón'),
                                                       (9, 'Volkswagen', 'Alemania'),
                                                       (10, 'Renault', 'Francia');
SET IDENTITY_INSERT tb_marca OFF;
GO

-- 6.2 Modelos --------------------------------------------------
SET IDENTITY_INSERT tb_modelo ON;
INSERT INTO tb_modelo (idModelo, idMarca, nombre, categoria, numeroPasajeros) VALUES
                                                                                  (1,  1, 'Yaris', 'Sedán', 5),
                                                                                  (2,  1, 'Corolla', 'Sedán', 5),
                                                                                  (3,  1, 'RAV4', 'SUV', 5),
                                                                                  (4,  2, 'Accent', 'Sedán', 5),
                                                                                  (5,  2, 'Tucson', 'SUV', 5),
                                                                                  (6,  3, 'Rio', 'Hatchback', 5),
                                                                                  (7,  3, 'Sportage', 'SUV', 5),
                                                                                  (8,  4, 'Versa', 'Sedán', 5),
                                                                                  (9,  4, 'Sentra', 'Sedán', 5),
                                                                                  (10, 5, 'Mazda 3', 'Hatchback', 5),
                                                                                  (11, 6, 'Spark', 'Hatchback', 5),
                                                                                  (12, 7, 'Fiesta', 'Sedán', 5),
                                                                                  (13, 8, 'Civic', 'Sedán', 5),
                                                                                  (14, 9, 'Gol', 'Hatchback', 5),
                                                                                  (15, 10, 'Logan', 'Sedán', 5);
SET IDENTITY_INSERT tb_modelo OFF;
GO

-- 6.3 Autos ----------------------------------------------------
SET IDENTITY_INSERT tb_auto ON;
INSERT INTO tb_auto (idAuto, placa, idMarca, idModelo, anio, color, kilometrajeActual, ultimaRevisionKm, proximaRevisionKm, precioPorDia, precioPorHora, moraPorDia, estado) VALUES
                                                                                                                                                                                 (1,  'ABC-123', 1,  1,  2020, 'Blanco',   45000,  40000,  50000,  120.00, 15.00, 30.00, 'Disponible'),
                                                                                                                                                                                 (2,  'DEF-456', 2,  4,  2019, 'Negro',    52000,  48000,  58000,  110.00, 13.00, 25.00, 'Disponible'),
                                                                                                                                                                                 (3,  'GHI-789', 3,  6,  2021, 'Rojo',     38000,  35000,  40000,  130.00, 16.00, 30.00, 'En reparación'),
                                                                                                                                                                                 (4,  'JKL-111', 4,  8,  2022, 'Plateado', 25000,  20000,  30000,  150.00, 18.00, 35.00, 'Disponible'),
                                                                                                                                                                                 (5,  'MNO-222', 5,  10, 2020, 'Azul',     60000,  55000,  65000,  160.00, 20.00, 35.00, 'Disponible'),
                                                                                                                                                                                 (6,  'PQR-333', 6,  11, 2018, 'Gris',     78000,  70000,  80000,  100.00, 12.00, 20.00, 'Disponible'),
                                                                                                                                                                                 (7,  'STU-444', 7,  12, 2019, 'Blanco',   55000,  50000,  55000,  115.00, 14.00, 25.00, 'Disponible'),
                                                                                                                                                                                 (8,  'VWX-555', 8,  13, 2021, 'Negro',    32000,  30000,  35000,  180.00, 22.00, 40.00, 'En reparación'),
                                                                                                                                                                                 (9,  'YZA-666', 9,  14, 2017, 'Verde',    90000,  85000,  90000,  95.00,  11.00, 20.00, 'Disponible'),
                                                                                                                                                                                 (10, 'BCD-777', 10, 15, 2020, 'Gris',     48000,  45000,  50000,  125.00, 15.00, 25.00, 'Disponible');
SET IDENTITY_INSERT tb_auto OFF;
GO

-- 6.4 Licencias ------------------------------------------------
SET IDENTITY_INSERT tb_licencia ON;
INSERT INTO tb_licencia (idLicencia, numeroLicencia, categoria, fechaVencimiento) VALUES
                                                                                      (1,  'Q12345678', 'A-IIa', '2027-06-15'),
                                                                                      (2,  'Q87654321', 'A-IIa', '2026-11-20'),
                                                                                      (3,  'Q11223344', 'A-I',   '2028-03-10'),
                                                                                      (4,  'Q33445566', 'A-IIb', '2027-09-05'),
                                                                                      (5,  'Q55667788', 'A-IIa', '2026-08-22'),
                                                                                      (6,  'Q77889900', 'A-IIa', '2028-01-18'),
                                                                                      (7,  'Q99887766', 'A-IIIa','2027-12-01'),
                                                                                      (8,  'Q66778899', 'A-IIa', '2026-05-30'),
                                                                                      (9,  'Q44556677', 'A-I',   '2027-04-14'),
                                                                                      (10, 'Q22334455', 'A-IIa', '2028-07-09');
SET IDENTITY_INSERT tb_licencia OFF;
GO

-- 6.5 Clientes -------------------------------------------------
SET IDENTITY_INSERT tb_cliente ON;
INSERT INTO tb_cliente (idCliente, nombre, apellidoPaterno, apellidoMaterno, dni, telefono, email, direccion, idLicencia, numeroReservas, estado) VALUES
                                                                                                                                                      (1,  'Juan',   'Pérez',     'García',   '12345678', '987654321', 'juanperez@example.com',     'Av. Los Olivos 123, Lima',     1,  2, 'activo'),
                                                                                                                                                      (2,  'María',  'López',     'Flores',   '87654321', '912345678', 'marialopez@example.com',    'Jr. Las Palmeras 456, Lima',   2,  1, 'activo'),
                                                                                                                                                      (3,  'Carlos', 'Gómez',     'Ríos',     '11223344', '999555444', 'carlosgomez@example.com',   'Calle Real 789, Callao',       3,  1, 'activo'),
                                                                                                                                                      (4,  'Ana',    'Torres',    'Vargas',   '33445566', '922334455', 'anatorres@example.com',     'Av. Primavera 321, Lima',      4,  1, 'activo'),
                                                                                                                                                      (5,  'Luis',   'Ramos',     'Castillo', '55667788', '955667788', 'luisramos@example.com',     'Jr. Cusco 654, Arequipa',      5,  0, 'activo'),
                                                                                                                                                      (6,  'Elena',  'Mejía',     'Soto',     '77889900', '933221100', 'elenamejia@example.com',    'Av. Universitaria 111, Lima',  6,  0, 'activo'),
                                                                                                                                                      (7,  'Pedro',  'Castro',    'León',     '99887766', '988776655', 'pedrocastro@example.com',   'Calle Comercio 222, Trujillo', 7,  0, 'activo'),
                                                                                                                                                      (8,  'Rosa',   'Silva',     'Paredes',  '66778899', '944332211', 'rosasilva@example.com',     'Av. Brasil 333, Lima',         8,  0, 'activo'),
                                                                                                                                                      (9,  'Jorge',  'Medina',    'Reyes',    '44556677', '977665544', 'jorgemedina@example.com',   'Jr. Ayacucho 444, Cusco',      9,  0, 'activo'),
                                                                                                                                                      (10, 'Lucía',  'Flores',    'Hidalgo',  '22334455', '911223344', 'luciaflores@example.com',   'Av. Grau 555, Chiclayo',       10, 0, 'activo');
SET IDENTITY_INSERT tb_cliente OFF;
GO

-- 6.6 Reservas -------------------------------------------------
SET IDENTITY_INSERT tb_reserva ON;
INSERT INTO tb_reserva (idReserva, idCliente, idAuto, fechaInicio, horaInicio, fechaFin, horaFin, kilometrajeInicio, subtotal, total, estado, estadoEntrega, fechaCreacion, usuarioCreacion, fechaFinalizacion, usuarioFinalizacion) VALUES
                                                                                                                                                                                                                                         (1, 1, 1, '2025-12-10', '09:00', '2025-12-12', '18:00', 45000, 360.00, 360.00, 'Finalizada', 'Entregado OK', '2025-12-08 10:30:00', 'admin', '2025-12-12 17:45:00', 'admin'),
                                                                                                                                                                                                                                         (2, 2, 2, '2025-12-15', '10:00', '2025-12-18', '16:00', 52000, 440.00, 440.00, 'Finalizada', 'Entregado OK', '2025-12-12 09:15:00', 'admin', '2025-12-18 15:30:00', 'admin'),
                                                                                                                                                                                                                                         (3, 3, 4, '2025-11-05', '08:00', '2025-11-07', '20:00', 24800, 450.00, 520.00, 'Finalizada', 'Entregado con daños', '2025-11-02 14:00:00', 'admin', '2025-11-08 10:00:00', 'admin'),
                                                                                                                                                                                                                                         (4, 4, 5, '2025-10-01', '10:00', '2025-10-03', '18:00', 59500, 480.00, 480.00, 'Cancelada', 'Sin entregar', '2025-09-28 11:00:00', 'admin', NULL, NULL);
SET IDENTITY_INSERT tb_reserva OFF;
GO

-- Actualizar km_fin de reservas finalizadas
UPDATE tb_reserva SET kilometrajeFin = 45500 WHERE idReserva = 1;
UPDATE tb_reserva SET kilometrajeFin = 52300 WHERE idReserva = 2;
UPDATE tb_reserva SET kilometrajeFin = 25000, costoReparaciones = 70.00, total = 520.00 WHERE idReserva = 3;
GO

-- 6.7 Pagos ----------------------------------------------------
SET IDENTITY_INSERT tb_pago ON;
INSERT INTO tb_pago (idPago, idReserva, montoBase, montoMora, montoDanos, montoTotalPagado, fechaPago, metodoPago) VALUES
                                                                                                                       (1, 1, 360.00, 0,    0,      360.00, '2025-12-12 17:50:00', 'Tarjeta'),
                                                                                                                       (2, 2, 440.00, 0,    0,      440.00, '2025-12-18 15:35:00', 'Efectivo'),
                                                                                                                       (3, 3, 450.00, 70.00, 0,     520.00, '2025-11-08 10:10:00', 'Transferencia');
SET IDENTITY_INSERT tb_pago OFF;
GO

-- 6.8 Catálogo de Reparaciones ---------------------------------
SET IDENTITY_INSERT tb_catalogo_reparacion ON;
INSERT INTO tb_catalogo_reparacion (idCatalogoReparacion, descripcion, costoEstimado, tiempoEstimadoHoras) VALUES
                                                                                                               (1, 'Rayón de pintura', 200.00, 4),
                                                                                                               (2, 'Abolladura de carrocería', 500.00, 8),
                                                                                                               (3, 'Rotura de espejo lateral', 150.00, 2),
                                                                                                               (4, 'Daño de llanta/aro', 300.00, 3),
                                                                                                               (5, 'Rotura de parabrisas', 800.00, 12),
                                                                                                               (6, 'Daño interior (tapicería)', 250.00, 5),
                                                                                                               (7, 'Falla mecánica menor', 400.00, 6),
                                                                                                               (8, 'Daño de faro/luz', 200.00, 3);
SET IDENTITY_INSERT tb_catalogo_reparacion OFF;
GO

-- 6.9 Reparaciones ---------------------------------------------
SET IDENTITY_INSERT tb_reparacion ON;
INSERT INTO tb_reparacion (idReparacion, idReserva, idAuto, idCatalogoReparacion, descripcion, costo, estado, responsable, fechaReporte, usuarioReporte) VALUES
    (1, 3, 4, 1, 'Rayón leve en puerta trasera derecha', 70.00, 'Pendiente', 'Cliente', '2025-11-08 10:00:00', 'admin');
SET IDENTITY_INSERT tb_reparacion OFF;
GO

-- 6.10 Mantenimientos ------------------------------------------
INSERT INTO tb_mantenimiento (idAuto, fechaIngreso, fechaSalida, tipo, costo, detalle) VALUES
(3, '2025-12-20', NULL, 'Correctivo', 0, 'Cambio de pastillas de freno delanteras. Auto en taller.'),
(8, '2025-12-22', NULL, 'Preventivo', 250.00, 'Revisión programada de motor y cambio de aceite.');
GO

-- 6.11 Historial de Kilometraje --------------------------------
INSERT INTO tb_historial_kilometraje (idAuto, idReserva, kilometrajeAnterior, kilometrajeNuevo, tipoRegistro, usuarioRegistro) VALUES
(1, 1, 45000, 45500, 'Reserva', 'admin'),
(2, 2, 52000, 52300, 'Reserva', 'admin'),
(4, 3, 24800, 25000, 'Reserva', 'admin');
GO

-- 6.12 Configuraciones -----------------------------------------
INSERT INTO tb_configuracion (clave, valor, descripcion, tipo) VALUES
('MoraPorHora', '10.00', 'Penalización por cada hora de retraso en la devolución', 'decimal'),
('MoraPorDia', '50.00', 'Penalización por cada día de retraso en la devolución', 'decimal'),
('TiempoGraciaMinutos', '60', 'Minutos de tolerancia antes de aplicar mora', 'entero'),
('KmRevisionPreventiva', '5000', 'Cada cuántos kilómetros se recomienda mantenimiento preventivo', 'entero'),
('PermitirReservasSimultaneas', 'false', 'Si un cliente puede tener varias reservas activas al mismo tiempo', 'booleano'),
('DiasAnticipacionReserva', '1', 'Días mínimos de anticipación para crear una reserva', 'entero');
GO

-- 6.13 Usuarios ------------------------------------------------
-- Contraseñas (BCrypt):
--   admin123   -> $2a$10$txCV75IDyzhVolXP1WiHxO8yKJz578AtDfaEbTRPLww3RfvIf3D9y
--   cliente123 -> $2a$10$GJKccfi4IMsR1n.Qkim30eLsBURpVGBdo3dsxqs9YxUIhBmgJU/hi
INSERT INTO tb_usuario (Nombre, Correo, Clave, Rol) VALUES
('Admin DRIVO',   'admin@drivo.com',   '$2a$10$txCV75IDyzhVolXP1WiHxO8yKJz578AtDfaEbTRPLww3RfvIf3D9y', 'ADMIN'),
('Carlos Lopez',  'carlos@email.com',  '$2a$10$GJKccfi4IMsR1n.Qkim30eLsBURpVGBdo3dsxqs9YxUIhBmgJU/hi', 'CLIENTE'),
('Maria Garcia',  'maria@email.com',   '$2a$10$GJKccfi4IMsR1n.Qkim30eLsBURpVGBdo3dsxqs9YxUIhBmgJU/hi', 'CLIENTE');
GO

-- ============================================================
--  SECCION 7: VISTAS PARA REPORTES
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
PRINT 'Base de datos BD_RentCar creada exitosamente con 13 tablas y datos semilla.';
GO
