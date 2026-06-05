package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record LicenciaRequest(

        @NotBlank(message = "El número de licencia es obligatorio")
        String numeroLicencia,

        @NotBlank(message = "La categoría de licencia es obligatoria")
        String categoria,

        @NotNull(message = "La fecha de vencimiento es obligatoria")
        @Future(message = "La fecha de vencimiento debe ser futura")
        LocalDate fechaVencimiento
) {}
