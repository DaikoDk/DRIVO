package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record MantenimientoCreateRequest(
        @NotNull Integer idAuto,
        @NotNull LocalDate fechaIngreso,
        LocalDate fechaSalida,
        @NotBlank
        @Pattern(regexp = "Preventivo|Correctivo", message = "Tipo de mantenimiento no válido")
        String tipo,
        @DecimalMin("0") BigDecimal costo,
        String detalle
) {
        public BigDecimal costo() { return costo != null ? costo : BigDecimal.ZERO; }
}
