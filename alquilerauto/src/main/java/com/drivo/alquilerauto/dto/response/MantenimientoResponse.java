package com.drivo.alquilerauto.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MantenimientoResponse(
        Integer idMantenimiento,
        Integer idAuto,
        String placa,
        LocalDate fechaIngreso,
        LocalDate fechaSalida,
        String tipo,
        BigDecimal costo,
        String detalle
) {}
