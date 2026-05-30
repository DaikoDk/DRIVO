package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.entity.CatalogoReparacion;
import com.drivo.alquilerauto.service.CatalogoReparacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo-reparaciones")
@RequiredArgsConstructor
public class CatalogoReparacionController {

    private final CatalogoReparacionService service;

    @GetMapping
    public ResponseEntity<List<CatalogoReparacion>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CatalogoReparacion> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CatalogoReparacion> create(@Valid @RequestBody CatalogoReparacion catalogo) {
        return ResponseEntity.ok(service.create(catalogo));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CatalogoReparacion> update(@PathVariable Integer id,
                                                      @RequestBody CatalogoReparacion catalogo) {
        return ResponseEntity.ok(service.update(id, catalogo));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
