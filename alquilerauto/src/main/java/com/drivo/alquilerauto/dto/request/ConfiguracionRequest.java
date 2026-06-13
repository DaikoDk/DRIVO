package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ConfiguracionRequest(

        @NotBlank(message = "La clave es obligatoria")
        String clave,

        @NotBlank(message = "El valor es obligatorio")
        String valor,

        String descripcion,

        @Pattern(regexp = "decimal|entero|texto|booleano", message = "Tipo no válido")
        String tipo
) {}
