package com.drivo.alquilerauto.dto.response;

import java.math.BigDecimal;

public record DashboardResponse(
        long totalAutos,
        long autosDisponibles,
        long autosAlquilados,
        long autosMantenimiento,
        long totalClientes,
        long clientesActivos,
        long reservasActivas,
        long reservasHoy,
        BigDecimal ingresosMes
) {}
