package com.drivo.alquilerauto.mapper;

import com.drivo.alquilerauto.dto.request.MantenimientoCreateRequest;
import com.drivo.alquilerauto.dto.response.MantenimientoResponse;
import com.drivo.alquilerauto.entity.Mantenimiento;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MantenimientoMapper {

    @Mapping(source = "auto.idAuto", target = "idAuto")
    @Mapping(source = "auto.placa", target = "placa")
    MantenimientoResponse toResponse(Mantenimiento mantenimiento);

    List<MantenimientoResponse> toResponseList(List<Mantenimiento> mantenimientos);

    @Mapping(target = "idMantenimiento", ignore = true)
    @Mapping(target = "auto", ignore = true)
    @Mapping(target = "fechaSalida", ignore = true)
    Mantenimiento toEntity(MantenimientoCreateRequest request);
}
