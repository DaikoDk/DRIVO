package com.drivo.alquilerauto.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ClienteRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 50, message = "El nombre no puede superar 50 caracteres")
        String nombre,

        @NotBlank(message = "El apellido paterno es obligatorio")
        @Size(max = 50, message = "El apellido paterno no puede superar 50 caracteres")
        String apellidoPaterno,

        @Size(max = 50, message = "El apellido materno no puede superar 50 caracteres")
        String apellidoMaterno,

        @NotBlank(message = "El DNI es obligatorio")
        @Size(max = 15, message = "El DNI no puede superar 15 caracteres")
        String dni,

        @Size(max = 20, message = "El teléfono no puede superar 20 caracteres")
        String telefono,

        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene un formato válido")
        @Size(max = 100, message = "El email no puede superar 100 caracteres")
        String email,

        @Size(max = 200, message = "La dirección no puede superar 200 caracteres")
        String direccion,

        @NotNull(message = "Los datos de la licencia son obligatorios")
        @Valid
        LicenciaRequest licencia
) {}
