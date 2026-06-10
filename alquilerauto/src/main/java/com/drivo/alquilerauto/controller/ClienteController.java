package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.ApiResponse;
import com.drivo.alquilerauto.dto.request.ClienteRequest;
import com.drivo.alquilerauto.dto.response.ClienteResponse;
import com.drivo.alquilerauto.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClienteResponse>>> findAllActivos() {
        List<ClienteResponse> clientes = clienteService.findAllActivos();
        return ResponseEntity.ok(ApiResponse.ok(clientes, "Clientes activos obtenidos"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClienteResponse>> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(clienteService.findById(id), "Cliente encontrado"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ClienteResponse>> create(@Valid @RequestBody ClienteRequest request) {
        ClienteResponse creado = clienteService.create(request);
        return ResponseEntity.ok(ApiResponse.ok(creado, "Cliente creado exitosamente"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ClienteResponse>> update(
            @PathVariable Integer id,
            @Valid @RequestBody ClienteRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(clienteService.update(id, request), "Cliente actualizado exitosamente"));
    }

    @PatchMapping("/{id}/bloquear")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ClienteResponse>> bloquear(@PathVariable Integer id) {
        ClienteResponse bloqueado = clienteService.bloquear(id);
        return ResponseEntity.ok(ApiResponse.ok(bloqueado, "Cliente bloqueado exitosamente"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        clienteService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Cliente desactivado exitosamente"));
    }
}
