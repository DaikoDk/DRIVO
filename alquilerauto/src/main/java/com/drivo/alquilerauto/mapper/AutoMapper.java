package com.drivo.alquilerauto.mapper;

import com.drivo.alquilerauto.dto.request.AutoRequest;
import com.drivo.alquilerauto.dto.response.AutoResponse;
import com.drivo.alquilerauto.entity.Auto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AutoMapper {

    @Mapping(source = "marca.nombre", target = "marca")
    @Mapping(source = "modelo.nombre", target = "modelo")
    @Mapping(source = "modelo.categoria", target = "categoria")
    AutoResponse toResponse(Auto auto);

    List<AutoResponse> toResponseList(List<Auto> autos);

    @Mapping(target = "idAuto", ignore = true)
    @Mapping(target = "marca", ignore = true)
    @Mapping(target = "modelo", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fechaRegistro", ignore = true)
    @Mapping(target = "fechaUltimaActualizacion", ignore = true)
    @Mapping(target = "ultimaRevisionKm", ignore = true)
    @Mapping(target = "proximaRevisionKm", ignore = true)
    @Mapping(target = "reservas", ignore = true)
    @Mapping(target = "reparaciones", ignore = true)
    @Mapping(target = "mantenimientos", ignore = true)
    @Mapping(target = "historialKilometraje", ignore = true)
    Auto toEntity(AutoRequest request);

    @Mapping(target = "idAuto", ignore = true)
    @Mapping(target = "marca", ignore = true)
    @Mapping(target = "modelo", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fechaRegistro", ignore = true)
    @Mapping(target = "fechaUltimaActualizacion", ignore = true)
    @Mapping(target = "ultimaRevisionKm", ignore = true)
    @Mapping(target = "proximaRevisionKm", ignore = true)
    @Mapping(target = "reservas", ignore = true)
    @Mapping(target = "reparaciones", ignore = true)
    @Mapping(target = "mantenimientos", ignore = true)
    @Mapping(target = "historialKilometraje", ignore = true)
    void updateEntity(AutoRequest request, @MappingTarget Auto auto);
}
