package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record LicenciaRequest(

        @NotBlank(message = "El número de licencia es obligatorio")
        String numeroLicencia,

        @NotBlank(message = "La categoría de licencia es obligatoria")
        @Pattern(regexp = "A-I|A-IIa|A-IIb|A-IIIa|A-IIIb|A-IIIc", message = "Categoría de licencia no válida")
        String categoria,

        @NotNull(message = "La fecha de vencimiento es obligatoria")
        @Future(message = "La fecha de vencimiento debe ser futura")
        LocalDate fechaVencimiento
) {}
