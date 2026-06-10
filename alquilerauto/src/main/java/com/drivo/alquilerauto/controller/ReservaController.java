package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.ApiResponse;
import com.drivo.alquilerauto.dto.request.IniciarRequest;
import com.drivo.alquilerauto.dto.request.ReservaCreateRequest;
import com.drivo.alquilerauto.dto.request.ReservaFinalizarRequest;
import com.drivo.alquilerauto.dto.response.ReservaResponse;
import com.drivo.alquilerauto.mapper.ReservaMapper;
import com.drivo.alquilerauto.service.ReservaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;
    private final ReservaMapper reservaMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReservaResponse>>> findAll(
            @RequestParam(required = false) String estado) {
        if (estado != null && !estado.isBlank()) {
            List<ReservaResponse> reservas = reservaMapper.toResponseList(
                    reservaService.findByEstado(estado));
            return ResponseEntity.ok(ApiResponse.ok(reservas, "Reservas con estado " + estado + " obtenidas"));
        }
        List<ReservaResponse> reservas = reservaMapper.toResponseList(
                reservaService.findAllWithDetails());
        return ResponseEntity.ok(ApiResponse.ok(reservas, "Reservas obtenidas"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservaResponse>> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(
                reservaMapper.toResponse(reservaService.findById(id)), "Reserva encontrada"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReservaResponse>> create(
            @Valid @RequestBody ReservaCreateRequest request) {
        ReservaResponse creada = reservaService.create(request);
        return ResponseEntity.ok(ApiResponse.ok(creada, "Reserva creada exitosamente"));
    }

    @PatchMapping("/{id}/iniciar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReservaResponse>> iniciar(
            @PathVariable Integer id,
            @Valid @RequestBody IniciarRequest request) {
        ReservaResponse iniciada = reservaService.iniciar(id, request);
        return ResponseEntity.ok(ApiResponse.ok(iniciada, "Reserva iniciada exitosamente"));
    }

    @PatchMapping("/{id}/finalizar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReservaResponse>> finalizar(
            @PathVariable Integer id,
            @Valid @RequestBody ReservaFinalizarRequest request) {
        ReservaResponse finalizada = reservaService.finalizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok(finalizada, "Reserva finalizada exitosamente"));
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReservaResponse>> cancelar(@PathVariable Integer id) {
        ReservaResponse cancelada = reservaService.cancelar(id);
        return ResponseEntity.ok(ApiResponse.ok(cancelada, "Reserva cancelada exitosamente"));
    }
}
