package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.request.ConfiguracionRequest;
import com.drivo.alquilerauto.dto.response.ConfiguracionResponse;
import com.drivo.alquilerauto.entity.Configuracion;
import com.drivo.alquilerauto.exception.BadRequestException;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.mapper.ConfiguracionMapper;
import com.drivo.alquilerauto.repository.ConfiguracionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ConfiguracionService {

    private final ConfiguracionRepository repository;
    private final ConfiguracionMapper mapper;

    @Transactional(readOnly = true)
    public List<ConfiguracionResponse> findAll() {
        return mapper.toResponseList(repository.findAll());
    }

    @Transactional(readOnly = true)
    public ConfiguracionResponse findById(Integer id) {
        Configuracion config = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Configuración no encontrada con id: " + id));
        return mapper.toResponse(config);
    }

    @Transactional(readOnly = true)
    public ConfiguracionResponse findByClave(String clave) {
        Configuracion config = repository.findByClave(clave)
                .orElseThrow(() -> new ResourceNotFoundException("Configuración no encontrada: " + clave));
        return mapper.toResponse(config);
    }

    public ConfiguracionResponse create(ConfiguracionRequest request) {
        if (repository.findByClave(request.clave()).isPresent()) {
            throw new BadRequestException("Ya existe una configuración con la clave: " + request.clave());
        }

        Configuracion config = mapper.toEntity(request);
        config.setFechaActualizacion(LocalDateTime.now());
        return mapper.toResponse(repository.save(config));
    }

    public ConfiguracionResponse update(Integer id, ConfiguracionRequest request) {
        Configuracion config = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Configuración no encontrada con id: " + id));

        mapper.updateEntity(request, config);
        config.setFechaActualizacion(LocalDateTime.now());
        return mapper.toResponse(repository.save(config));
    }

    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Configuración no encontrada con id: " + id);
        }
        repository.deleteById(id);
    }
}
