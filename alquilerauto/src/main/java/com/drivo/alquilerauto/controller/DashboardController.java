package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

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
}
