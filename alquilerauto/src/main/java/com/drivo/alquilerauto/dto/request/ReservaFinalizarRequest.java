package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.*;

public record ReservaFinalizarRequest(
        @NotNull Integer kilometrajeFin,
        @NotBlank String estadoEntrega,
        String observaciones,
        String usuario
) {}
