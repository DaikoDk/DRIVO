package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.response.DashboardResponse;
import com.drivo.alquilerauto.dto.response.IngresoMensualResponse;
import com.drivo.alquilerauto.dto.response.ReservaHoyResponse;
import com.drivo.alquilerauto.dto.response.VehiculoMantenimientoResponse;
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

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(dashboardService.getResumen());
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getResumen());
    }

    @GetMapping("/reservas-hoy")
    public ResponseEntity<List<ReservaHoyResponse>> getReservasHoy() {
        return ResponseEntity.ok(dashboardService.getReservasHoy());
    }

    @GetMapping("/vehiculos-mantenimiento")
    public ResponseEntity<List<VehiculoMantenimientoResponse>> getVehiculosMantenimiento() {
        return ResponseEntity.ok(dashboardService.getVehiculosMantenimiento());
    }

    @GetMapping("/ingresos-mensuales")
    public ResponseEntity<List<IngresoMensualResponse>> getIngresosMensuales() {
        return ResponseEntity.ok(dashboardService.getIngresosMensuales());
    }
}
