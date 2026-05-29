package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.request.MantenimientoCreateRequest;
import com.drivo.alquilerauto.entity.Mantenimiento;
import com.drivo.alquilerauto.service.MantenimientoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mantenimientos")
@RequiredArgsConstructor
public class MantenimientoController {

    private final MantenimientoService mantenimientoService;

    @GetMapping
    public ResponseEntity<List<Mantenimiento>> findAll() {
        return ResponseEntity.ok(mantenimientoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mantenimiento> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(mantenimientoService.findById(id));
    }

    @GetMapping("/auto/{idAuto}")
    public ResponseEntity<List<Mantenimiento>> findByAuto(@PathVariable Integer idAuto) {
        return ResponseEntity.ok(mantenimientoService.findByAuto(idAuto));
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<Mantenimiento>> findPendientes() {
        return ResponseEntity.ok(mantenimientoService.findPendientes());
    }

    @PostMapping
    public ResponseEntity<Mantenimiento> create(@Valid @RequestBody MantenimientoCreateRequest request) {
        return ResponseEntity.ok(mantenimientoService.create(request));
    }

    @PutMapping("/{id}/finalizar")
    public ResponseEntity<Mantenimiento> finalizar(@PathVariable Integer id,
                                                    @RequestBody Map<String, Object> body) {
        LocalDate fechaSalida = body.get("fechaSalida") != null
                ? LocalDate.parse(body.get("fechaSalida").toString())
                : LocalDate.now();
        String detalle = body.get("detalle") != null ? body.get("detalle").toString() : null;
        return ResponseEntity.ok(mantenimientoService.finalizar(id, fechaSalida, detalle));
    }
}
