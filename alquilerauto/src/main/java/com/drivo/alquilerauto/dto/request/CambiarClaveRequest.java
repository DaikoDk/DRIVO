package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CambiarClaveRequest(

        @NotBlank(message = "La clave actual es obligatoria")
        String claveActual,

        @NotBlank(message = "La nueva clave es obligatoria")
        @Size(min = 6, message = "La clave debe tener al menos 6 caracteres")
        String claveNueva
) {}
