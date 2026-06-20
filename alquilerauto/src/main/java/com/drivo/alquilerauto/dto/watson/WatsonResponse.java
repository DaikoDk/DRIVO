package com.drivo.alquilerauto.dto.watson;

import java.util.List;

public record WatsonResponse(
    String respuesta,
    List<String> acciones,
    boolean esOffline
) {
    public static WatsonResponse of(String respuesta) {
        return new WatsonResponse(respuesta, List.of(), true);
    }

    public static WatsonResponse of(String respuesta, List<String> acciones) {
        return new WatsonResponse(respuesta, acciones, true);
    }
}
