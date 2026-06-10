package com.drivo.alquilerauto.mapper;

import com.drivo.alquilerauto.dto.request.ClienteRequest;
import com.drivo.alquilerauto.dto.response.ClienteResponse;
import com.drivo.alquilerauto.entity.Cliente;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ClienteMapper {

    @Mapping(source = "licencia.idLicencia", target = "idLicencia")
    @Mapping(source = "licencia.numeroLicencia", target = "numeroLicencia")
    @Mapping(source = "licencia.categoria", target = "categoriaLicencia")
    @Mapping(source = "licencia.fechaVencimiento", target = "fechaVencimientoLicencia")
    ClienteResponse toResponse(Cliente cliente);

    List<ClienteResponse> toResponseList(List<Cliente> clientes);

    @Mapping(target = "idCliente", ignore = true)
    @Mapping(target = "licencia", ignore = true)
    @Mapping(target = "numeroReservas", ignore = true)
    @Mapping(target = "numeroIncidentes", ignore = true)
    @Mapping(target = "bloqueado", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fechaRegistro", ignore = true)
    @Mapping(target = "reservas", ignore = true)
    Cliente toEntity(ClienteRequest request);

    @Mapping(target = "idCliente", ignore = true)
    @Mapping(target = "licencia", ignore = true)
    @Mapping(target = "numeroReservas", ignore = true)
    @Mapping(target = "numeroIncidentes", ignore = true)
    @Mapping(target = "bloqueado", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "activo", ignore = true)
    @Mapping(target = "fechaRegistro", ignore = true)
    @Mapping(target = "reservas", ignore = true)
    void updateEntity(ClienteRequest request, @MappingTarget Cliente cliente);
}
