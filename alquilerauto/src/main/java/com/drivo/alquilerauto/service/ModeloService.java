package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.request.ModeloRequest;
import com.drivo.alquilerauto.dto.response.ModeloResponse;
import com.drivo.alquilerauto.entity.Marca;
import com.drivo.alquilerauto.entity.Modelo;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.mapper.ModeloMapper;
import com.drivo.alquilerauto.repository.MarcaRepository;
import com.drivo.alquilerauto.repository.ModeloRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ModeloService {

    private final ModeloRepository modeloRepository;
    private final MarcaRepository marcaRepository;
    private final ModeloMapper modeloMapper;


    @Transactional(readOnly = true)
    public List<ModeloResponse> findAllActivos() {
        return modeloMapper.toResponseList(modeloRepository.findByActivoTrue());
    }

    @Transactional(readOnly = true)
    public ModeloResponse findById(Integer id) {
        return modeloMapper.toResponse(obtenerModeloOFallar(id));
    }


    @Transactional(readOnly = true)
    public List<ModeloResponse> findByMarca(Integer idMarca) {
        if (!marcaRepository.existsById(idMarca)) {
            throw new ResourceNotFoundException("Marca no encontrada con id: " + idMarca);
        }
        return modeloMapper.toResponseList(
                modeloRepository.findByMarcaIdMarcaAndActivoTrue(idMarca)
        );
    }


    public ModeloResponse create(ModeloRequest request) {
        Marca marca = marcaRepository.findById(request.idMarca())
                .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada con id: " + request.idMarca()));

        Modelo modelo = modeloMapper.toEntity(request);
        modelo.setMarca(marca);
        modelo.setActivo(true);
        modelo.setFechaRegistro(LocalDateTime.now());
        if (request.numeroPasajeros() != null) {
            modelo.setNumeroPasajeros(request.numeroPasajeros());
        } else {
            modelo.setNumeroPasajeros(5);
        }
        return modeloMapper.toResponse(modeloRepository.save(modelo));
    }

    public ModeloResponse update(Integer id, ModeloRequest request) {
        Modelo modelo = obtenerModeloOFallar(id);
        if (request.idMarca() != null && !request.idMarca().equals(modelo.getMarca().getIdMarca())) {
            Marca nuevaMarca = marcaRepository.findById(request.idMarca())
                    .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada con id: " + request.idMarca()));
            modelo.setMarca(nuevaMarca);
        }
        modeloMapper.updateEntity(request, modelo);
        return modeloMapper.toResponse(modeloRepository.save(modelo));
    }

    public void delete(Integer id) {
        Modelo modelo = obtenerModeloOFallar(id);
        modelo.setActivo(false);
        modeloRepository.save(modelo);
    }


    private Modelo obtenerModeloOFallar(Integer id) {
        return modeloRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Modelo no encontrado con id: " + id));
    }
}