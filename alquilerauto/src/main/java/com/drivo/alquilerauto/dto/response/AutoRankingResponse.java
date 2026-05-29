package com.drivo.alquilerauto.dto.response;

import java.math.BigDecimal;

public record AutoRankingResponse(
        Integer idAuto,
        String placa,
        String marca,
        String modelo,
        String estado,
        Long totalReservas,
        BigDecimal ingresosGenerados,
        Long kmTotalesRecorridos
) {}
