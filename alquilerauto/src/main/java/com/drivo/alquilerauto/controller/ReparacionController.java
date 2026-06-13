package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.ApiResponse;
import com.drivo.alquilerauto.dto.request.ReparacionCreateRequest;
import com.drivo.alquilerauto.dto.request.ReparacionEstadoRequest;
import com.drivo.alquilerauto.dto.response.ReparacionResponse;
import com.drivo.alquilerauto.service.ReparacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reparaciones")
@RequiredArgsConstructor
public class ReparacionController {

    private final ReparacionService reparacionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReparacionResponse>>> findAll(
            @RequestParam(required = false) String estado) {
        if (estado != null && !estado.isBlank()) {
            List<ReparacionResponse> reparaciones = reparacionService.findByEstado(estado);
            return ResponseEntity.ok(ApiResponse.ok(reparaciones, "Reparaciones con estado " + estado + " obtenidas"));
        }
        List<ReparacionResponse> reparaciones = reparacionService.findAll();
        return ResponseEntity.ok(ApiResponse.ok(reparaciones, "Reparaciones obtenidas"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReparacionResponse>> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(reparacionService.findById(id), "Reparación encontrada"));
    }

    @GetMapping("/reserva/{idReserva}")
    public ResponseEntity<ApiResponse<List<ReparacionResponse>>> findByReserva(
            @PathVariable Integer idReserva) {
        return ResponseEntity.ok(ApiResponse.ok(reparacionService.findByReserva(idReserva),
                "Reparaciones de la reserva obtenidas"));
    }

    @GetMapping("/auto/{idAuto}")
    public ResponseEntity<ApiResponse<List<ReparacionResponse>>> findByAuto(
            @PathVariable Integer idAuto) {
        return ResponseEntity.ok(ApiResponse.ok(reparacionService.findByAuto(idAuto),
                "Reparaciones del auto obtenidas"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReparacionResponse>> create(
            @Valid @RequestBody ReparacionCreateRequest request) {
        ReparacionResponse creada = reparacionService.create(request);
        return ResponseEntity.ok(ApiResponse.ok(creada, "Reparación creada exitosamente"));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReparacionResponse>> updateEstado(
            @PathVariable Integer id,
            @Valid @RequestBody ReparacionEstadoRequest request) {
        ReparacionResponse actualizada = reparacionService.updateEstado(id, request);
        return ResponseEntity.ok(ApiResponse.ok(actualizada, "Estado de reparación actualizado"));
    }
}
