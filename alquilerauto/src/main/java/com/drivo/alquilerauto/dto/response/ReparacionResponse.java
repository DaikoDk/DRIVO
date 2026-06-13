package com.drivo.alquilerauto.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReparacionResponse(
        Integer idReparacion,
        Integer idReserva,
        Integer idAuto,
        String placa,
        Integer idCatalogoReparacion,
        String descripcionCatalogo,
        String descripcion,
        BigDecimal costo,
        String estado,
        String responsable,
        LocalDateTime fechaReporte,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        String usuarioReporte
) {}
