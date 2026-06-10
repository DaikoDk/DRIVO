package com.drivo.alquilerauto.dto.response;

import java.time.LocalDate;

public record VehiculoMantenimientoResponse(
        Integer idMantenimiento,
        String placa,
        String marca,
        String modelo,
        LocalDate fechaIngreso,
        String tipo,
        String detalle
) {}
