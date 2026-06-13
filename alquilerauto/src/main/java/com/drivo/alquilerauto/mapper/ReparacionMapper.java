package com.drivo.alquilerauto.mapper;

import com.drivo.alquilerauto.dto.response.ReparacionResponse;
import com.drivo.alquilerauto.entity.Reparacion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReparacionMapper {

    @Mapping(source = "reserva.idReserva", target = "idReserva")
    @Mapping(source = "auto.idAuto", target = "idAuto")
    @Mapping(source = "auto.placa", target = "placa")
    @Mapping(source = "catalogoReparacion.idCatalogoReparacion", target = "idCatalogoReparacion")
    @Mapping(source = "catalogoReparacion.descripcion", target = "descripcionCatalogo")
    ReparacionResponse toResponse(Reparacion reparacion);

    List<ReparacionResponse> toResponseList(List<Reparacion> reparaciones);
}
