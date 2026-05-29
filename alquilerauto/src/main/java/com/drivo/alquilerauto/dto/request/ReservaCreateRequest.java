package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record ReservaCreateRequest(
        @NotNull Integer idCliente,
        @NotNull Integer idAuto,
        @NotNull LocalDate fechaInicio,
        @NotNull LocalTime horaInicio,
        @NotNull LocalDate fechaFin,
        @NotNull LocalTime horaFin,
        @NotNull @DecimalMin("0.01") BigDecimal subtotal,
        @NotNull @DecimalMin("0.01") BigDecimal total,
        String usuarioCreacion
) {}
