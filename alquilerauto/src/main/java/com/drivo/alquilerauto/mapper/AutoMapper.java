package com.drivo.alquilerauto.mapper;

import com.drivo.alquilerauto.dto.response.AutoResponse;
import com.drivo.alquilerauto.entity.Auto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AutoMapper {

    @Mapping(source = "marca.nombre", target = "marca")
    @Mapping(source = "modelo.nombre", target = "modelo")
    @Mapping(source = "modelo.categoria", target = "categoria")
    AutoResponse toResponse(Auto auto);

    List<AutoResponse> toResponseList(List<Auto> autos);
}
