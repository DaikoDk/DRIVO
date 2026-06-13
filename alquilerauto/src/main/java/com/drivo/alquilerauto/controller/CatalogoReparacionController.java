package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.ApiResponse;
import com.drivo.alquilerauto.dto.response.CatalogoReparacionResponse;
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
    public ResponseEntity<ApiResponse<List<CatalogoReparacion>>> findAll() {
        return ResponseEntity.ok(ApiResponse.ok(service.findAll(), "Catálogo de reparaciones obtenido"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CatalogoReparacion>> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(service.findById(id),
                "Catálogo de reparación encontrado"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CatalogoReparacion>> create(
            @Valid @RequestBody CatalogoReparacion catalogo) {
        return ResponseEntity.ok(ApiResponse.ok(service.create(catalogo),
                "Catálogo de reparación creado exitosamente"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CatalogoReparacion>> update(
            @PathVariable Integer id,
            @RequestBody CatalogoReparacion catalogo) {
        return ResponseEntity.ok(ApiResponse.ok(service.update(id, catalogo),
                "Catálogo de reparación actualizado exitosamente"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Catálogo de reparación desactivado exitosamente"));
    }
}
