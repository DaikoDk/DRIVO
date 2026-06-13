package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record PagoCreateRequest(
        @NotNull Integer idReserva,
        @NotNull @DecimalMin("0") BigDecimal montoBase,
        @DecimalMin("0") BigDecimal montoMora,
        @DecimalMin("0") BigDecimal montoDanos,
        @NotBlank String metodoPago
) {
        public BigDecimal montoMora() { return montoMora != null ? montoMora : BigDecimal.ZERO; }
        public BigDecimal montoDanos() { return montoDanos != null ? montoDanos : BigDecimal.ZERO; }
}
