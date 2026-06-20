package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.watson.WatsonRequest;
import com.drivo.alquilerauto.dto.watson.WatsonResponse;
import com.drivo.alquilerauto.service.WatsonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/watson")
@RequiredArgsConstructor
public class WatsonController {

    private final WatsonService watsonService;

    @PostMapping("/message")
    public ResponseEntity<WatsonResponse> message(
            @Valid @RequestBody WatsonRequest request,
            Authentication authentication) {

        String correo = null;
        if (authentication != null && authentication.isAuthenticated()
            && !"anonymousUser".equals(authentication.getPrincipal())) {
            correo = authentication.getName();
        }

        WatsonResponse response = watsonService.procesarMensaje(request.mensaje(), correo);
        return ResponseEntity.ok(response);
    }
}
