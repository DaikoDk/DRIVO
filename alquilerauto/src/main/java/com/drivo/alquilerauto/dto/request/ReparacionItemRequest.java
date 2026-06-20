package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ReparacionItemRequest(
        Integer idCatalogoReparacion,

        @NotBlank(message = "La descripción de la reparación es obligatoria")
        String descripcion,

        @NotNull(message = "El costo de la reparación es obligatorio")
        @DecimalMin(value = "0.0", inclusive = false, message = "El costo debe ser mayor a 0")
        BigDecimal costo,

        String responsable,

        String estado
) {}
