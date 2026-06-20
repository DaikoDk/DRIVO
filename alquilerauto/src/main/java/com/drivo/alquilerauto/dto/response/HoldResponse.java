package com.drivo.alquilerauto.dto.response;

import java.time.LocalDateTime;

public record HoldResponse(
        LocalDateTime fechaExpiracion
) {}
