package com.drivo.alquilerauto.dto.response;

import java.math.BigDecimal;

public record IngresoMensualResponse(
        String mes,
        BigDecimal monto
) {}
