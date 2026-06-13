package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record MantenimientoFinalizarRequest(
        LocalDate fechaSalida,
        String detalle
) {}
