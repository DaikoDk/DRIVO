package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MarcaRequest(

        @NotBlank(message = "El nombre de la marca es obligatorio")
        @Size(max = 50, message = "El nombre no puede superar 50 caracteres")
        String nombre,
        @Size(max = 50, message = "El país de origen no puede superar 50 caracteres")
        String paisOrigen
) {}