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
public class DashboardController {

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalVehiculos", 0);
        stats.put("vehiculosDisponibles", 0);
        stats.put("reservasActivas", 0);
        stats.put("ingresosMes", 0);
        return ResponseEntity.ok(ApiResponse.ok(stats, "Estadisticas obtenidas"));
    }

    @GetMapping("/reservas-hoy")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getReservasHoy() {
        return ResponseEntity.ok(ApiResponse.ok(Collections.emptyList(), "Reservas de hoy"));
    }

    @GetMapping("/vehiculos-mantenimiento")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getVehiculosMantenimiento() {
        return ResponseEntity.ok(ApiResponse.ok(Collections.emptyList(), "Vehiculos en mantenimiento"));
    }

    @GetMapping("/ingresos-mensuales")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getIngresosMensuales() {
        return ResponseEntity.ok(ApiResponse.ok(Collections.emptyList(), "Ingresos mensuales"));
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
