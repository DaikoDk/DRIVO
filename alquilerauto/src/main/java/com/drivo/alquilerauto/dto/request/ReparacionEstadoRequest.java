package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ReparacionEstadoRequest(
        @NotBlank(message = "El estado es obligatorio")
        String estado
) {}
