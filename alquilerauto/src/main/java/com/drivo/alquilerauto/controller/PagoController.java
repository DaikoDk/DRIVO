package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.request.PagoCreateRequest;
import com.drivo.alquilerauto.dto.response.PagoResponse;
import com.drivo.alquilerauto.service.PagoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoService pagoService;

    @GetMapping
    public ResponseEntity<List<PagoResponse>> findAll(
            @RequestParam(required = false) Integer reserva) {
        if (reserva != null) {
            return ResponseEntity.ok(pagoService.findByReserva(reserva));
        }
        return ResponseEntity.ok(pagoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagoResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(pagoService.findById(id));
    }

    @GetMapping("/reserva/{idReserva}")
    public ResponseEntity<List<PagoResponse>> findByReserva(@PathVariable Integer idReserva) {
        return ResponseEntity.ok(pagoService.findByReserva(idReserva));
    }

    @PostMapping
    public ResponseEntity<PagoResponse> create(@Valid @RequestBody PagoCreateRequest request) {
        return ResponseEntity.ok(pagoService.create(request));
    }
}
