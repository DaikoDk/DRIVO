package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ModeloRequest(

        @NotNull(message = "El id de la marca es obligatorio")
        Integer idMarca,
        @NotBlank(message = "El nombre del modelo es obligatorio")
        @Size(max = 50, message = "El nombre no puede superar 50 caracteres")
        String nombre,
        @Size(max = 30, message = "La categoría no puede superar 30 caracteres")
        String categoria,
        @Min(value = 1, message = "El número de pasajeros debe ser al menos 1")
        Integer numeroPasajeros
) {}
