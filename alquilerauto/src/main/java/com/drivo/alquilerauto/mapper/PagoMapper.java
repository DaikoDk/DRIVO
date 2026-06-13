package com.drivo.alquilerauto.mapper;

import com.drivo.alquilerauto.dto.request.PagoCreateRequest;
import com.drivo.alquilerauto.dto.response.PagoResponse;
import com.drivo.alquilerauto.entity.Pago;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PagoMapper {

    @Mapping(source = "reserva.idReserva", target = "idReserva")
    @Mapping(target = "nombreCliente", expression = "java(pago.getReserva().getCliente().getNombre() + \" \" + pago.getReserva().getCliente().getApellidoPaterno())")
    PagoResponse toResponse(Pago pago);

    List<PagoResponse> toResponseList(List<Pago> pagos);

    @Mapping(target = "idPago", ignore = true)
    @Mapping(target = "reserva", ignore = true)
    @Mapping(target = "fechaPago", ignore = true)
    @Mapping(target = "montoTotalPagado", ignore = true)
    Pago toEntity(PagoCreateRequest request);
}
