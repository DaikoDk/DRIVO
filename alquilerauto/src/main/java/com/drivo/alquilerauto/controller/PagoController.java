package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.ApiResponse;
import com.drivo.alquilerauto.dto.request.PagoCreateRequest;
import com.drivo.alquilerauto.dto.response.PagoResponse;
import com.drivo.alquilerauto.entity.Pago;
import com.drivo.alquilerauto.mapper.PagoMapper;
import com.drivo.alquilerauto.service.PagoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoService pagoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PagoResponse>>> findAll(
            @RequestParam(required = false) Integer reserva) {
        if (reserva != null) {
            return ResponseEntity.ok(
                    ApiResponse.ok(pagoService.findByReserva(reserva), "Pagos de la reserva obtenidos"));
        }
        return ResponseEntity.ok(ApiResponse.ok(pagoService.findAll(), "Pagos obtenidos"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PagoResponse>> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(pagoService.findById(id), "Pago encontrado"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagoResponse>> create(@Valid @RequestBody PagoCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(pagoService.create(request), "Pago registrado exitosamente"));
    }
}
