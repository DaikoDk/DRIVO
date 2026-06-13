package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.ApiResponse;
import com.drivo.alquilerauto.dto.request.ConfiguracionRequest;
import com.drivo.alquilerauto.dto.response.ConfiguracionResponse;
import com.drivo.alquilerauto.service.ConfiguracionService;
import jakarta.validation.Valid;
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ConfiguracionResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.ok(service.findAll(), "Configuraciones obtenidas"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ConfiguracionResponse>> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(service.findById(id), "Configuración encontrada"));
    }

    @GetMapping("/clave/{clave}")
    public ResponseEntity<ApiResponse<ConfiguracionResponse>> findByClave(@PathVariable String clave) {
        return ResponseEntity.ok(ApiResponse.ok(service.findByClave(clave), "Configuración encontrada"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ConfiguracionResponse>> create(
            @Valid @RequestBody ConfiguracionRequest request) {
        ConfiguracionResponse creada = service.create(request);
        return ResponseEntity.ok(ApiResponse.ok(creada, "Configuración creada exitosamente"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ConfiguracionResponse>> update(
            @PathVariable Integer id,
            @Valid @RequestBody ConfiguracionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(service.update(id, request),
                "Configuración actualizada exitosamente"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Configuración eliminada exitosamente"));
    }
}
