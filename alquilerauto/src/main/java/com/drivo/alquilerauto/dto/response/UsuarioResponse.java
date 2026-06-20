package com.drivo.alquilerauto.dto.response;

public record UsuarioResponse(
        Integer idUsuario,
        String nombre,
        String correo,
        String rol
) {}
