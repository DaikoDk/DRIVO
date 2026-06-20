package com.drivo.alquilerauto.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;

public record BufferCheckResponse(
        boolean riesgo,
        String mensaje,
        long horasMargen,
        LocalDate fechaFinAnterior,
        LocalTime horaFinAnterior
) {}
