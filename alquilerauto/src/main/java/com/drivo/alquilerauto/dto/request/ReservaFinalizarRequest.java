package com.drivo.alquilerauto.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ReservaFinalizarRequest(

        @NotNull(message = "El kilometraje de fin es obligatorio")
        @Min(value = 0, message = "El kilometraje no puede ser negativo")
        Integer kilometrajeFin,

        String observaciones,

        String usuario,

        @NotNull(message = "El estado de entrega es obligatorio")
        String estadoEntrega,

        List<@Valid ReparacionItemRequest> reparaciones
) {}
