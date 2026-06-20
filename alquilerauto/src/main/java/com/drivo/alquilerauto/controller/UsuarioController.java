package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.ApiResponse;
import com.drivo.alquilerauto.dto.request.CambiarClaveRequest;
import com.drivo.alquilerauto.dto.response.UsuarioResponse;
import com.drivo.alquilerauto.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UsuarioResponse>> getMe(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(
                usuarioService.getMe(authentication.getName()),
                "Usuario obtenido"));
    }

    @PatchMapping("/cambiar-clave")
    public ResponseEntity<ApiResponse<Void>> cambiarClave(
            @Valid @RequestBody CambiarClaveRequest request,
            Authentication authentication) {
        usuarioService.cambiarClave(request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Clave actualizada exitosamente"));
    }
}
