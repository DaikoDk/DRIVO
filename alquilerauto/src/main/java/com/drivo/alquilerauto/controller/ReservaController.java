package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.request.ReservaCreateRequest;
import com.drivo.alquilerauto.dto.request.ReservaFinalizarRequest;
import com.drivo.alquilerauto.dto.response.ReservaResponse;
import com.drivo.alquilerauto.entity.Reserva;
import com.drivo.alquilerauto.mapper.ReservaMapper;
import com.drivo.alquilerauto.service.ReservaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;
    private final ReservaMapper reservaMapper;

    @GetMapping
    public ResponseEntity<List<ReservaResponse>> findAll() {
        return ResponseEntity.ok(reservaMapper.toResponseList(reservaService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reserva> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(reservaService.findById(id));
    }

    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<List<Reserva>> findByCliente(@PathVariable Integer idCliente) {
        return ResponseEntity.ok(reservaService.findByCliente(idCliente));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Reserva>> findByEstado(@PathVariable String estado) {
        return ResponseEntity.ok(reservaService.findByEstado(estado));
    }

    @GetMapping("/activas")
    public ResponseEntity<List<Reserva>> findActivas() {
        return ResponseEntity.ok(reservaService.findActivas());
    }

    @PostMapping
    public ResponseEntity<Reserva> create(@Valid @RequestBody ReservaCreateRequest request) {
        return ResponseEntity.ok(reservaService.create(request));
    }

    @PutMapping("/{id}/finalizar")
    public ResponseEntity<Reserva> finalizar(@PathVariable Integer id,
                                              @Valid @RequestBody ReservaFinalizarRequest request) {
        return ResponseEntity.ok(reservaService.finalizar(id, request));
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Reserva> cancelar(@PathVariable Integer id,
                                             @RequestParam String usuario) {
        return ResponseEntity.ok(reservaService.cancelar(id, usuario));
    }
}
