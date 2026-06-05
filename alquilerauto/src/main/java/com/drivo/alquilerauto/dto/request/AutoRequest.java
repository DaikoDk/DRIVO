package com.drivo.alquilerauto.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record AutoRequest(

        @NotBlank(message = "La placa es obligatoria")
        @Size(max = 10, message = "La placa no puede superar 10 caracteres")
        String placa,

        @NotNull(message = "El id de la marca es obligatorio")
        Integer idMarca,

        @NotNull(message = "El id del modelo es obligatorio")
        Integer idModelo,

        @NotNull(message = "El año es obligatorio")
        @Min(value = 1900, message = "El año debe ser al menos 1900")
        Integer anio,

        @Size(max = 30, message = "El color no puede superar 30 caracteres")
        String color,

        @Size(max = 50, message = "El número de motor no puede superar 50 caracteres")
        String numeroMotor,

        @Size(max = 50, message = "El número de chasis no puede superar 50 caracteres")
        String numeroChasis,

        Integer kilometrajeActual,

        @NotNull(message = "El precio por día es obligatorio")
        @DecimalMin(value = "0.01", message = "El precio por día debe ser mayor a 0")
        BigDecimal precioPorDia,

        BigDecimal precioPorHora,

        @NotNull(message = "La mora por día es obligatoria")
        @DecimalMin(value = "0.0", message = "La mora por día no puede ser negativa")
        BigDecimal moraPorDia
) {}
