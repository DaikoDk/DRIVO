package com.drivo.alquilerauto.mapper;

import com.drivo.alquilerauto.dto.response.PagoResponse;
import com.drivo.alquilerauto.entity.Pago;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PagoMapper {

    @Mapping(source = "reserva.idReserva", target = "idReserva")
    PagoResponse toResponse(Pago pago);

    List<PagoResponse> toResponseList(List<Pago> pagos);
}
