package com.drivo.alquilerauto.mapper;

import com.drivo.alquilerauto.dto.request.MarcaRequest;
import com.drivo.alquilerauto.dto.response.MarcaResponse;
import com.drivo.alquilerauto.entity.Marca;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MarcaMapper {

    MarcaResponse toResponse(Marca marca);
    List<MarcaResponse> toResponseList(List<Marca> marcas);

    @Mapping(target = "idMarca", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fechaRegistro", ignore = true)
    @Mapping(target = "modelos", ignore = true)
    @Mapping(target = "autos", ignore = true)
    Marca toEntity(MarcaRequest request);

    @Mapping(target = "idMarca", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fechaRegistro", ignore = true)
    @Mapping(target = "modelos", ignore = true)
    @Mapping(target = "autos", ignore = true)
    void updateEntity(MarcaRequest request, @MappingTarget Marca marca);
}