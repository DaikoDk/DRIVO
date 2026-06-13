package com.drivo.alquilerauto.dto.response;

import java.time.LocalDateTime;

public record ConfiguracionResponse(
        Integer idConfiguracion,
        String clave,
        String valor,
        String descripcion,
        String tipo,
        LocalDateTime fechaActualizacion
) {}
