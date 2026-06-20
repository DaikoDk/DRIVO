package com.drivo.alquilerauto.dto.request;

import java.time.LocalDate;

public record ClienteMeUpdateRequest(
        String nombre,
        String apellidoPaterno,
        String apellidoMaterno,
        String telefono,
        String direccion,
        String numeroLicencia,
        String categoriaLicencia,
        LocalDate fechaVencimientoLicencia
) {}
