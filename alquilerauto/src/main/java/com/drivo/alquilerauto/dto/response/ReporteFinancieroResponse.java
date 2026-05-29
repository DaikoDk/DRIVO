package com.drivo.alquilerauto.dto.response;

import java.math.BigDecimal;

public record ReporteFinancieroResponse(
        Integer idReserva,
        String cliente,
        String placa,
        java.time.LocalDate fechaInicio,
        java.time.LocalDate fechaFin,
        BigDecimal subtotal,
        BigDecimal mora,
        BigDecimal costoReparaciones,
        BigDecimal total,
        String estado,
        BigDecimal totalPagado,
        String metodoPago,
        java.time.LocalDateTime fechaFinalizacion
) {}
