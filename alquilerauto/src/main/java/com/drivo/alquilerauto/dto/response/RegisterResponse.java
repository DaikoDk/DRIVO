package com.drivo.alquilerauto.dto.response;

public record RegisterResponse(
        String token,
        String nombre,
        String rol
) {}
