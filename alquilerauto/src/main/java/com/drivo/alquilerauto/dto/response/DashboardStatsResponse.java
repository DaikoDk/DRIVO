package com.drivo.alquilerauto.dto.response;

import java.math.BigDecimal;

public record DashboardStatsResponse(
        long totalAutos,
        long autosDisponibles,
        long totalClientes,
        long reservasActivas,
        BigDecimal ingresosMes
) {}
