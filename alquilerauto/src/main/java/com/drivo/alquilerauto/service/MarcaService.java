package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.entity.Marca;
import com.drivo.alquilerauto.exception.BadRequestException;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.repository.MarcaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MarcaService {

    private final MarcaRepository marcaRepository;

    @Transactional(readOnly = true)
    public List<Marca> findAll() {
        return marcaRepository.findByActivoTrue();
    }

    @Transactional(readOnly = true)
    public Marca findById(Integer id) {
        return marcaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada"));
    }

    public Marca create(Marca marca) {
        if (marcaRepository.existsByNombre(marca.getNombre())) {
            throw new BadRequestException("Ya existe una marca con ese nombre");
        }
        return marcaRepository.save(marca);
    }

    public Marca update(Integer id, Marca datos) {
        Marca marca = findById(id);
        marca.setNombre(datos.getNombre());
        marca.setPaisOrigen(datos.getPaisOrigen());
        return marcaRepository.save(marca);
    }

    public void delete(Integer id) {
        Marca marca = findById(id);
        marca.setActivo(false);
        marcaRepository.save(marca);
    }
}
