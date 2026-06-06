package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record IniciarRequest(

        @NotNull(message = "El kilometraje de inicio es obligatorio")
        @Min(value = 0, message = "El kilometraje no puede ser negativo")
        Integer kilometrajeInicio
) {}
