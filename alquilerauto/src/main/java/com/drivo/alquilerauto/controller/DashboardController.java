package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.ApiResponse;
import com.drivo.alquilerauto.dto.response.*;
import com.drivo.alquilerauto.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats() {
        return ResponseEntity.ok(
                ApiResponse.ok(dashboardService.getStats(), "Estadísticas del dashboard obtenidas"));
    }


    @GetMapping("/reservas-hoy")
    public ResponseEntity<ApiResponse<List<ReservaHoyResponse>>> getReservasHoy() {
        return ResponseEntity.ok(
                ApiResponse.ok(dashboardService.getReservasHoy(), "Reservas de hoy obtenidas"));
    }


    @GetMapping("/vehiculos-mantenimiento")
    public ResponseEntity<ApiResponse<List<VehiculoMantenimientoResponse>>> getVehiculosMantenimiento() {
        return ResponseEntity.ok(
                ApiResponse.ok(dashboardService.getVehiculosEnMantenimiento(),
                        "Vehículos en mantenimiento obtenidos"));
    }


    @GetMapping("/ingresos-mensuales")
    public ResponseEntity<ApiResponse<List<IngresoMensualResponse>>> getIngresosMensuales() {
        return ResponseEntity.ok(
                ApiResponse.ok(dashboardService.getIngresosMensuales(),
                        "Ingresos mensuales obtenidos"));
    }
}
