package com.drivo.alquilerauto.mapper;

import com.drivo.alquilerauto.dto.request.ReservaCreateRequest;
import com.drivo.alquilerauto.dto.response.ReservaResponse;
import com.drivo.alquilerauto.entity.Reserva;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReservaMapper {

    @Mapping(source = "cliente.idCliente", target = "idCliente")
    @Mapping(target = "nombreCliente", expression = "java(r.getCliente().getNombre() + \" \" + r.getCliente().getApellidoPaterno())")
    @Mapping(source = "cliente.dni", target = "dniCliente")
    @Mapping(source = "auto.idAuto", target = "idAuto")
    @Mapping(source = "auto.placa", target = "placa")
    @Mapping(source = "auto.marca.nombre", target = "marca")
    @Mapping(source = "auto.modelo.nombre", target = "modelo")
    @Mapping(source = "estado.codigo", target = "estado")
    ReservaResponse toResponse(Reserva r);

    List<ReservaResponse> toResponseList(List<Reserva> reservas);

    @Mapping(target = "idReserva", ignore = true)
    @Mapping(target = "cliente", ignore = true)
    @Mapping(target = "auto", ignore = true)
    @Mapping(target = "subtotal", ignore = true)
    @Mapping(target = "total", ignore = true)
    @Mapping(target = "kilometrajeInicio", ignore = true)
    @Mapping(target = "kilometrajeFin", ignore = true)
    @Mapping(target = "mora", ignore = true)
    @Mapping(target = "costoReparaciones", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "estadoEntrega", ignore = true)
    @Mapping(target = "observacionesEntrega", ignore = true)
    @Mapping(target = "fechaHoraInicioReal", ignore = true)
    @Mapping(target = "fechaHoraFinReal", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "fechaFinalizacion", ignore = true)
    @Mapping(target = "usuarioFinalizacion", ignore = true)
    @Mapping(target = "pagos", ignore = true)
    @Mapping(target = "reparaciones", ignore = true)
    @Mapping(target = "historialKilometraje", ignore = true)
    Reserva toEntity(ReservaCreateRequest request);
}
