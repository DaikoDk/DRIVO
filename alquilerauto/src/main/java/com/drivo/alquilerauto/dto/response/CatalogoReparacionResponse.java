package com.drivo.alquilerauto.dto.response;

import java.math.BigDecimal;

public record CatalogoReparacionResponse(
        Integer idCatalogoReparacion,
        String descripcion,
        BigDecimal costoEstimado,
        Integer tiempoEstimadoHoras
) {}
