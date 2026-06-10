package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.request.ReparacionCreateRequest;
import com.drivo.alquilerauto.entity.Reparacion;
import com.drivo.alquilerauto.service.ReparacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reparaciones")
@RequiredArgsConstructor
public class ReparacionController {

    private final ReparacionService reparacionService;

    @GetMapping
    public ResponseEntity<List<Reparacion>> findAll() {
        return ResponseEntity.ok(reparacionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reparacion> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(reparacionService.findById(id));
    }

    @GetMapping("/reserva/{idReserva}")
    public ResponseEntity<List<Reparacion>> findByReserva(@PathVariable Integer idReserva) {
        return ResponseEntity.ok(reparacionService.findByReserva(idReserva));
    }

    @GetMapping("/auto/{idAuto}")
    public ResponseEntity<List<Reparacion>> findByAuto(@PathVariable Integer idAuto) {
        return ResponseEntity.ok(reparacionService.findByAuto(idAuto));
    }

    @PostMapping
    public ResponseEntity<Reparacion> create(@Valid @RequestBody ReparacionCreateRequest request) {
        return ResponseEntity.ok(reparacionService.create(request));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Reparacion> updateEstado(@PathVariable Integer id, @RequestParam String estado) {
        return ResponseEntity.ok(reparacionService.updateEstado(id, estado));
    }
}
