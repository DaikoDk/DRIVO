package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ReparacionCreateRequest(
        @NotNull Integer idReserva,
        @NotNull Integer idAuto,
        Integer idCatalogoReparacion,
        @NotBlank String descripcion,
        @NotNull @DecimalMin("0") BigDecimal costo,
        String responsable,
        String usuarioReporte
) {}
