package com.drivo.alquilerauto.dto.response;

import java.math.BigDecimal;

public record AutoResponse(
        Integer idAuto,
        String placa,
        String marca,
        String modelo,
        String categoria,
        Integer anio,
        String color,
        Integer kilometrajeActual,
        BigDecimal precioPorDia,
        BigDecimal precioPorHora,
        BigDecimal moraPorDia,
        String estado,
        String fotoUrl
) {}
