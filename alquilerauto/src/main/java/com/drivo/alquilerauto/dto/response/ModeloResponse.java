package com.drivo.alquilerauto.dto.response;

import java.time.LocalDateTime;

public record ModeloResponse(
        Integer idModelo,
        Integer idMarca,
        String marca,
        String nombre,
        String categoria,
        Integer numeroPasajeros,
        Boolean activo,
        LocalDateTime fechaRegistro
) {}
