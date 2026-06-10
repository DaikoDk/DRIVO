package com.drivo.alquilerauto.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record ReservaHoyResponse(
        Integer idReserva,
        String nombreCliente,
        String dniCliente,
        String placa,
        String marca,
        String modelo,
        LocalDate fechaInicio,
        LocalTime horaInicio,
        LocalDate fechaFin,
        LocalTime horaFin,
        BigDecimal total,
        String estado
) {}
