-- ============================================================
--  STORED PROCEDURES - ALQUILER AUTO (BD_RentCar)
--  Motor: SQL Server  |  Proyecto: EFSRT - AlquilerAuto
--  Fecha: 18/06/2026  |  Ejecutar despues de DRIVO_BD.sql
-- ============================================================
USE BD_RentCar;
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
--  5.2 Crear reserva (auto-inicio: nace En proceso)
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
    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO tb_reserva (
            idCliente, idAuto, fechaInicio, horaInicio, fechaFin, horaFin,
            subtotal, total, usuarioCreacion, estado, fechaHoraInicioReal, kilometrajeInicio
        )
        SELECT
            @idCliente, @idAuto, @fechaInicio, @horaInicio, @fechaFin, @horaFin,
            @subtotal, @total, @usuario, 'En proceso', GETDATE(), a.kilometrajeActual
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
--  5.3 Finalizar reserva
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
        SET estado              = 'Finalizada',
            estadoEntrega       = @estadoEntrega,
            kilometrajeFin      = @kilometrajeFin,
            observacionesEntrega = @observaciones,
            fechaHoraFinReal    = GETDATE(),
            fechaFinalizacion   = GETDATE(),
            usuarioFinalizacion = @usuario
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
    SELECT
        (SELECT COUNT(*)   FROM tb_auto    WHERE activo = 1)                                                                                                AS TotalAutos,
        (SELECT COUNT(*)   FROM tb_auto    WHERE activo = 1 AND estado = 'Disponible')                                                                      AS AutosDisponibles,
        (SELECT COUNT(*)   FROM tb_auto    WHERE activo = 1 AND estado = 'En proceso')                                                                      AS AutosAlquilados,
        (SELECT COUNT(*)   FROM tb_auto    WHERE activo = 1 AND estado = 'En reparación')                                                                   AS AutosMantenimiento,
        (SELECT COUNT(*)   FROM tb_cliente WHERE activo = 1)                                                                                                AS TotalClientes,
        (SELECT COUNT(*)   FROM tb_cliente WHERE activo = 1 AND bloqueado = 0 AND estado = 'activo')                                                        AS ClientesActivos,
        (SELECT COUNT(*)   FROM tb_reserva WHERE estado = 'En proceso')                                                                                     AS ReservasActivas,
        (SELECT COUNT(*)   FROM tb_reserva WHERE CAST(fechaCreacion AS DATE) = CAST(GETDATE() AS DATE))                                                     AS ReservasHoy,
        (SELECT ISNULL(SUM(total), 0) FROM tb_reserva WHERE estado = 'Finalizada'
            AND MONTH(fechaFinalizacion) = MONTH(GETDATE())
            AND YEAR(fechaFinalizacion)  = YEAR(GETDATE()))                                                                                                 AS IngresosMes;
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
        r.estado,
        ISNULL(p.montoTotalPagado, 0)               AS totalPagado,
        ISNULL(p.metodoPago, 'Sin pago')            AS metodoPago,
        r.fechaFinalizacion
    FROM tb_reserva r
    INNER JOIN tb_cliente c ON r.idCliente = c.idCliente
    INNER JOIN tb_auto    a ON r.idAuto    = a.idAuto
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
        AND r.estado     = 'Finalizada'
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
        WHERE r.estado = 'Finalizada'
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
          AND estado   = 'En proceso'
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
        AND r.estado     = 'Finalizada'
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

PRINT 'Stored procedures creados exitosamente.';
GO