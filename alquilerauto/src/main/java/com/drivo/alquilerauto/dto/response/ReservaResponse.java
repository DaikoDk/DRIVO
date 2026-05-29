package com.drivo.alquilerauto.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

public record ReservaResponse(
        Integer idReserva,
        Integer idCliente,
        String nombreCliente,
        String dniCliente,
        Integer idAuto,
        String placa,
        String marca,
        String modelo,
        LocalDate fechaInicio,
        LocalTime horaInicio,
        LocalDate fechaFin,
        LocalTime horaFin,
        Integer kilometrajeInicio,
        Integer kilometrajeFin,
        BigDecimal subtotal,
        BigDecimal mora,
        BigDecimal costoReparaciones,
        BigDecimal total,
        String estado,
        String estadoEntrega,
        String observacionesEntrega,
        LocalDateTime fechaCreacion,
        String usuarioCreacion,
        LocalDateTime fechaFinalizacion,
        String usuarioFinalizacion
) {}
