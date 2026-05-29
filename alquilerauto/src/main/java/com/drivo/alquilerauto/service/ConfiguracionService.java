package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.entity.Configuracion;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.repository.ConfiguracionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ConfiguracionService {

    private final ConfiguracionRepository repository;

    @Transactional(readOnly = true)
    public List<Configuracion> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Configuracion findById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Configuración no encontrada"));
    }

    @Transactional(readOnly = true)
    public Configuracion findByClave(String clave) {
        return repository.findByClave(clave)
                .orElseThrow(() -> new ResourceNotFoundException("Configuración no encontrada: " + clave));
    }

    public Configuracion create(Configuracion config) {
        return repository.save(config);
    }

    public Configuracion update(Integer id, Configuracion datos) {
        Configuracion config = findById(id);
        config.setValor(datos.getValor());
        config.setDescripcion(datos.getDescripcion());
        config.setTipo(datos.getTipo());
        return repository.save(config);
    }
}
