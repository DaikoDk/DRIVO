package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.ApiResponse;
import com.drivo.alquilerauto.dto.request.MarcaRequest;
import com.drivo.alquilerauto.dto.response.MarcaResponse;
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


    @GetMapping("/activos")
    public ResponseEntity<ApiResponse<List<MarcaResponse>>> findAllActivos() {
        List<MarcaResponse> marcas = marcaService.findAllActivos();
        return ResponseEntity.ok(ApiResponse.ok(marcas, "Marcas activas obtenidas"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MarcaResponse>> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(marcaService.findById(id), "Marca encontrada"));
    }


    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MarcaResponse>> create(@Valid @RequestBody MarcaRequest request) {
        MarcaResponse creada = marcaService.create(request);
        return ResponseEntity.ok(ApiResponse.ok(creada, "Marca creada exitosamente"));
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MarcaResponse>> update(
            @PathVariable Integer id,
            @Valid @RequestBody MarcaRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(marcaService.update(id, request), "Marca actualizada"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        marcaService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Marca desactivada exitosamente"));
    }
}