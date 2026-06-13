package com.drivo.alquilerauto.mapper;

import com.drivo.alquilerauto.dto.request.ConfiguracionRequest;
import com.drivo.alquilerauto.dto.response.ConfiguracionResponse;
import com.drivo.alquilerauto.entity.Configuracion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ConfiguracionMapper {

    ConfiguracionResponse toResponse(Configuracion configuracion);

    List<ConfiguracionResponse> toResponseList(List<Configuracion> configuraciones);

    @Mapping(target = "idConfiguracion", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    Configuracion toEntity(ConfiguracionRequest request);

    @Mapping(target = "idConfiguracion", ignore = true)
    @Mapping(target = "clave", ignore = true)
    @Mapping(target = "fechaActualizacion", ignore = true)
    void updateEntity(ConfiguracionRequest request, @MappingTarget Configuracion configuracion);
}
