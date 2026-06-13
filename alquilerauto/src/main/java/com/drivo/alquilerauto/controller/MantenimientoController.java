package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.ApiResponse;
import com.drivo.alquilerauto.dto.request.MantenimientoCreateRequest;
import com.drivo.alquilerauto.dto.request.MantenimientoFinalizarRequest;
import com.drivo.alquilerauto.dto.response.MantenimientoResponse;
import com.drivo.alquilerauto.service.MantenimientoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mantenimientos")
@RequiredArgsConstructor
public class MantenimientoController {

    private final MantenimientoService mantenimientoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MantenimientoResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.ok(mantenimientoService.findAll(), "Mantenimientos obtenidos"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MantenimientoResponse>> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(mantenimientoService.findById(id), "Mantenimiento encontrado"));
    }

    @GetMapping("/auto/{idAuto}")
    public ResponseEntity<ApiResponse<List<MantenimientoResponse>>> findByAuto(
            @PathVariable Integer idAuto) {
        return ResponseEntity.ok(ApiResponse.ok(mantenimientoService.findByAuto(idAuto),
                "Mantenimientos del auto obtenidos"));
    }

    @GetMapping("/en-curso")
    public ResponseEntity<ApiResponse<List<MantenimientoResponse>>> findEnCurso() {
        return ResponseEntity.ok(ApiResponse.ok(mantenimientoService.findEnCurso(),
                "Mantenimientos en curso obtenidos"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MantenimientoResponse>> create(
            @Valid @RequestBody MantenimientoCreateRequest request) {
        MantenimientoResponse creado = mantenimientoService.create(request);
        return ResponseEntity.ok(ApiResponse.ok(creado, "Mantenimiento creado exitosamente"));
    }

    @PatchMapping("/{id}/finalizar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MantenimientoResponse>> finalizar(
            @PathVariable Integer id,
            @Valid @RequestBody MantenimientoFinalizarRequest request) {
        MantenimientoResponse finalizado = mantenimientoService.finalizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok(finalizado, "Mantenimiento finalizado exitosamente"));
    }
}
