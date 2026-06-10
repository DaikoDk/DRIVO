package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.ApiResponse;
import com.drivo.alquilerauto.dto.request.ModeloRequest;
import com.drivo.alquilerauto.dto.response.ModeloResponse;
import com.drivo.alquilerauto.entity.Modelo;
import com.drivo.alquilerauto.service.ModeloService;
import jakarta.validation.Valid;
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


    @GetMapping("/activos")
    public ResponseEntity<ApiResponse<List<ModeloResponse>>> findAllActivos() {
        return ResponseEntity.ok(ApiResponse.ok(modeloService.findAllActivos(), "Modelos activos obtenidos"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ModeloResponse>> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(modeloService.findById(id), "Modelo encontrado"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ModeloResponse>>> findByMarca(
            @RequestParam(required = false) Integer idMarca) {
        if (idMarca != null) {
            return ResponseEntity.ok(
                    ApiResponse.ok(modeloService.findByMarca(idMarca), "Modelos de la marca obtenidos"));
        }
        return ResponseEntity.ok(ApiResponse.ok(modeloService.findAllActivos(), "Modelos activos obtenidos"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ModeloResponse>> create(@Valid @RequestBody ModeloRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(modeloService.create(request), "Modelo creado exitosamente"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ModeloResponse>> update(
            @PathVariable Integer id,
            @Valid @RequestBody ModeloRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(modeloService.update(id, request), "Modelo actualizado"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        modeloService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Modelo desactivado exitosamente"));
    }
}