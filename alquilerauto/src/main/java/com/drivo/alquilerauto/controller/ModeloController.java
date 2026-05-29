package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.entity.Modelo;
import com.drivo.alquilerauto.service.ModeloService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modelos")
@RequiredArgsConstructor
public class ModeloController {

    private final ModeloService modeloService;

    @GetMapping
    public ResponseEntity<List<Modelo>> findAll() {
        return ResponseEntity.ok(modeloService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Modelo> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(modeloService.findById(id));
    }

    @GetMapping("/marca/{idMarca}")
    public ResponseEntity<List<Modelo>> findByMarca(@PathVariable Integer idMarca) {
        return ResponseEntity.ok(modeloService.findByMarca(idMarca));
    }

    @PostMapping
    @PreAuthorize("hasRole('Administrador')")
    public ResponseEntity<Modelo> create(@RequestBody Modelo modelo) {
        return ResponseEntity.ok(modeloService.create(modelo));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Administrador')")
    public ResponseEntity<Modelo> update(@PathVariable Integer id, @RequestBody Modelo modelo) {
        return ResponseEntity.ok(modeloService.update(id, modelo));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Administrador')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        modeloService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
