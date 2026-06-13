package com.drivo.alquilerauto.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record ReservaHoyResponse(
        Integer idReserva,
        String cliente,
        String placa,
        String marca,
        String modelo,
        LocalDate fechaInicio,
        LocalTime horaInicio,
        LocalDate fechaFin,
        LocalTime horaFin,
        String estado,
        BigDecimal total
) {}
