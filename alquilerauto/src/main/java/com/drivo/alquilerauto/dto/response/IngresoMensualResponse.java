package com.drivo.alquilerauto.dto.response;

import java.math.BigDecimal;

public record IngresoMensualResponse(
        String mes,
        int anio,
        int numeroMes,
        BigDecimal monto
) {}
