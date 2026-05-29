package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.entity.Configuracion;
import com.drivo.alquilerauto.service.ConfiguracionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/configuraciones")
@RequiredArgsConstructor
public class ConfiguracionController {

    private final ConfiguracionService service;

    @GetMapping
    @PreAuthorize("hasRole('Administrador')")
    public ResponseEntity<List<Configuracion>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('Administrador')")
    public ResponseEntity<Configuracion> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/clave/{clave}")
    public ResponseEntity<Configuracion> findByClave(@PathVariable String clave) {
        return ResponseEntity.ok(service.findByClave(clave));
    }

    @PostMapping
    @PreAuthorize("hasRole('Administrador')")
    public ResponseEntity<Configuracion> create(@RequestBody Configuracion config) {
        return ResponseEntity.ok(service.create(config));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Administrador')")
    public ResponseEntity<Configuracion> update(@PathVariable Integer id, @RequestBody Configuracion config) {
        return ResponseEntity.ok(service.update(id, config));
    }
}
