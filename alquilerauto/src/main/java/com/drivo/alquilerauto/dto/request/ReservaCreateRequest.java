package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservaCreateRequest(
        @NotNull(message = "El id del cliente es obligatorio")
        Integer idCliente,

        @NotNull(message = "El id del auto es obligatorio")
        Integer idAuto,

        @NotNull(message = "La fecha de inicio es obligatoria")
        @FutureOrPresent(message = "La fecha de inicio debe ser presente o futura")
        LocalDate fechaInicio,

        @NotNull(message = "La hora de inicio es obligatoria")
        LocalTime horaInicio,

        @NotNull(message = "La fecha de fin es obligatoria")
        @FutureOrPresent(message = "La fecha de fin debe ser presente o futura")
        LocalDate fechaFin,

        @NotNull(message = "La hora de fin es obligatoria")
        LocalTime horaFin,

        String usuarioCreacion
) {}
