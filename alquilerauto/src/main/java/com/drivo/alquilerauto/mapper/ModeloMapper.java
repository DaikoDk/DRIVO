package com.drivo.alquilerauto.mapper;

import com.drivo.alquilerauto.dto.request.ModeloRequest;
import com.drivo.alquilerauto.dto.response.ModeloResponse;
import com.drivo.alquilerauto.entity.Modelo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ModeloMapper {

    @Mapping(source = "marca.idMarca", target = "idMarca")
    @Mapping(source = "marca.nombre",  target = "marca")
    ModeloResponse toResponse(Modelo modelo);

    List<ModeloResponse> toResponseList(List<Modelo> modelos);


    @Mapping(target = "idModelo", ignore = true)
    @Mapping(target = "marca", ignore = true)       // el service lo asigna
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fechaRegistro", ignore = true)
    @Mapping(target = "autos", ignore = true)
    Modelo toEntity(ModeloRequest request);


    @Mapping(target = "idModelo", ignore = true)
    @Mapping(target = "marca", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fechaRegistro", ignore = true)
    @Mapping(target = "autos", ignore = true)
    void updateEntity(ModeloRequest request, @MappingTarget Modelo modelo);
}