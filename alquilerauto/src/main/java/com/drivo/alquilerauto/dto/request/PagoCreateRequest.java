package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record PagoCreateRequest(
        @NotNull(message = "El id de la reserva es obligatorio")
        Integer idReserva,
        @NotNull(message = "El monto base es obligatorio")
        @DecimalMin(value = "0.01", message = "El monto base debe ser mayor a 0")
        BigDecimal montoBase,
        @DecimalMin(value = "0.0", message = "La mora no puede ser negativa")
        BigDecimal montoMora,
        @DecimalMin(value = "0.0", message = "Los daños no pueden ser negativos")
        BigDecimal montoDanos,
        @NotBlank(message = "El método de pago es obligatorio")
        String metodoPago
) {
        public BigDecimal montoMora()  { return montoMora  != null ? montoMora  : BigDecimal.ZERO; }
        public BigDecimal montoDanos() { return montoDanos != null ? montoDanos : BigDecimal.ZERO; }
}
