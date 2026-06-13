package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.ApiResponse;
import com.drivo.alquilerauto.dto.request.ClienteMeUpdateRequest;
import com.drivo.alquilerauto.dto.request.ClienteRequest;
import com.drivo.alquilerauto.dto.response.ClienteResponse;
import com.drivo.alquilerauto.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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

    @GetMapping("/me")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<ApiResponse<ClienteResponse>> getMe(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(
                clienteService.getAuthenticatedCliente(authentication.getName()),
                "Perfil obtenido"));
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

    @PutMapping("/me")
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<ApiResponse<ClienteResponse>> updateMe(
            Authentication authentication,
            @RequestBody ClienteMeUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                clienteService.updateMe(authentication.getName(), request),
                "Perfil actualizado"));
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

    @PatchMapping("/{id}/desbloquear")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ClienteResponse>> desbloquear(@PathVariable Integer id) {
        ClienteResponse desbloqueado = clienteService.desbloquear(id);
        return ResponseEntity.ok(ApiResponse.ok(desbloqueado, "Cliente desbloqueado exitosamente"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        clienteService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Cliente desactivado exitosamente"));
    }
}
