package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.response.AutoResponse;
import com.drivo.alquilerauto.entity.Auto;
import com.drivo.alquilerauto.mapper.AutoMapper;
import com.drivo.alquilerauto.service.AutoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/autos")
@RequiredArgsConstructor
public class AutoController {

    private final AutoService autoService;
    private final AutoMapper autoMapper;

    @GetMapping
    public ResponseEntity<List<AutoResponse>> findAll() {
        return ResponseEntity.ok(autoMapper.toResponseList(autoService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Auto> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(autoService.findById(id));
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<AutoResponse>> findDisponibles() {
        return ResponseEntity.ok(autoMapper.toResponseList(autoService.findDisponibles()));
    }

    @GetMapping("/disponibles-rango")
    public ResponseEntity<List<AutoResponse>> findDisponiblesEnRango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(autoMapper.toResponseList(autoService.findDisponiblesEnRango(inicio, fin)));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Auto>> findByEstado(@PathVariable String estado) {
        return ResponseEntity.ok(autoService.findByEstado(estado));
    }

    @PostMapping
    @PreAuthorize("hasRole('Administrador')")
    public ResponseEntity<Auto> create(@Valid @RequestBody Auto auto) {
        return ResponseEntity.ok(autoService.create(auto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Administrador')")
    public ResponseEntity<Auto> update(@PathVariable Integer id, @RequestBody Auto auto) {
        return ResponseEntity.ok(autoService.update(id, auto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Administrador')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        autoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
