package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.entity.Marca;
import com.drivo.alquilerauto.service.MarcaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marcas")
@RequiredArgsConstructor
public class MarcaController {

    private final MarcaService marcaService;

    @GetMapping
    public ResponseEntity<List<Marca>> findAll() {
        return ResponseEntity.ok(marcaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Marca> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(marcaService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('Administrador')")
    public ResponseEntity<Marca> create(@Valid @RequestBody Marca marca) {
        return ResponseEntity.ok(marcaService.create(marca));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Administrador')")
    public ResponseEntity<Marca> update(@PathVariable Integer id, @RequestBody Marca marca) {
        return ResponseEntity.ok(marcaService.update(id, marca));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Administrador')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        marcaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
