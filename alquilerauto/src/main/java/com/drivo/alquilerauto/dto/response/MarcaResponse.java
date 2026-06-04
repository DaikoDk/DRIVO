package com.drivo.alquilerauto.dto.response;

import java.time.LocalDateTime;

public record MarcaResponse(
        Integer idMarca,
        String nombre,
        String paisOrigen,
        Boolean activo,
        LocalDateTime fechaRegistro
) {}
