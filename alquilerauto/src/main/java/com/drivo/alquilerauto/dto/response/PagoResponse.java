package com.drivo.alquilerauto.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PagoResponse(
        Integer idPago,
        Integer idReserva,
        String nombreCliente,
        BigDecimal montoBase,
        BigDecimal montoMora,
        BigDecimal montoDanos,
        BigDecimal montoTotalPagado,
        LocalDateTime fechaPago,
        String metodoPago
) {}
