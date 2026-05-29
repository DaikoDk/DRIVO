package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.entity.Modelo;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.repository.ModeloRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ModeloService {

    private final ModeloRepository modeloRepository;

    @Transactional(readOnly = true)
    public List<Modelo> findAll() {
        return modeloRepository.findByActivoTrue();
    }

    @Transactional(readOnly = true)
    public Modelo findById(Integer id) {
        return modeloRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Modelo no encontrado"));
    }

    @Transactional(readOnly = true)
    public List<Modelo> findByMarca(Integer idMarca) {
        return modeloRepository.findByMarcaIdMarcaAndActivoTrue(idMarca);
    }

    public Modelo create(Modelo modelo) {
        return modeloRepository.save(modelo);
    }

    public Modelo update(Integer id, Modelo datos) {
        Modelo modelo = findById(id);
        modelo.setNombre(datos.getNombre());
        modelo.setCategoria(datos.getCategoria());
        modelo.setNumeroPasajeros(datos.getNumeroPasajeros());
        if (datos.getMarca() != null) modelo.setMarca(datos.getMarca());
        return modeloRepository.save(modelo);
    }

    public void delete(Integer id) {
        Modelo modelo = findById(id);
        modelo.setActivo(false);
        modeloRepository.save(modelo);
    }
}
