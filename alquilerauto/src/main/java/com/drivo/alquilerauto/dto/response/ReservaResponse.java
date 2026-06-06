package com.drivo.alquilerauto.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

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
        LocalDateTime fechaHoraInicioReal,
        LocalDateTime fechaHoraFinReal,
        LocalDateTime fechaCreacion,
        String usuarioCreacion,
        LocalDateTime fechaFinalizacion,
        String usuarioFinalizacion
) {}
