package com.drivo.alquilerauto.dto.watson;

import jakarta.validation.constraints.NotBlank;

public record WatsonRequest(
    @NotBlank String mensaje
) {}
