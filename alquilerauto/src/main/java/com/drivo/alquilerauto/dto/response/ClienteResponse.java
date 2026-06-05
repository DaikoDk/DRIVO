package com.drivo.alquilerauto.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ClienteResponse(
        Integer idCliente,
        String nombre,
        String apellidoPaterno,
        String apellidoMaterno,
        String dni,
        String telefono,
        String email,
        String direccion,
        Integer idLicencia,
        String numeroLicencia,
        String categoriaLicencia,
        LocalDate fechaVencimientoLicencia,
        Integer numeroReservas,
        Integer numeroIncidentes,
        Boolean bloqueado,
        String estado,
        Boolean activo,
        LocalDateTime fechaRegistro
) {}
