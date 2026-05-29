package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.entity.Licencia;
import com.drivo.alquilerauto.service.LicenciaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/licencias")
@RequiredArgsConstructor
public class LicenciaController {

    private final LicenciaService licenciaService;

    @GetMapping
    public ResponseEntity<List<Licencia>> findAll() {
        return ResponseEntity.ok(licenciaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Licencia> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(licenciaService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('Administrador')")
    public ResponseEntity<Licencia> create(@RequestBody Licencia licencia) {
        return ResponseEntity.ok(licenciaService.create(licencia));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Administrador')")
    public ResponseEntity<Licencia> update(@PathVariable Integer id, @RequestBody Licencia licencia) {
        return ResponseEntity.ok(licenciaService.update(id, licencia));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Administrador')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        licenciaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
