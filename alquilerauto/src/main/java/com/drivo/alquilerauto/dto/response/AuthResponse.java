package com.drivo.alquilerauto.dto.response;

public record AuthResponse(
        String token,
        String nombre,
        String correo,
        String rol
) {}
