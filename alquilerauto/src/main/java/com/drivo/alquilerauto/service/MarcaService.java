package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.request.MarcaRequest;
import com.drivo.alquilerauto.dto.response.MarcaResponse;
import com.drivo.alquilerauto.entity.Marca;
import com.drivo.alquilerauto.exception.BadRequestException;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.mapper.MarcaMapper;
import com.drivo.alquilerauto.repository.MarcaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MarcaService {

    private final MarcaRepository marcaRepository;
    private final MarcaMapper marcaMapper;


    @Transactional(readOnly = true)
    public List<MarcaResponse> findAllActivos() {
        return marcaMapper.toResponseList(marcaRepository.findByActivoTrue());
    }

    @Transactional(readOnly = true)
    public MarcaResponse findById(Integer id) {
        return marcaMapper.toResponse(obtenerMarcaOFallar(id));
    }


    public MarcaResponse create(MarcaRequest request) {
        if (marcaRepository.existsByNombre(request.nombre())) {
            throw new BadRequestException("Ya existe una marca con el nombre: " + request.nombre());
        }
        Marca marca = marcaMapper.toEntity(request);
        marca.setActivo(true);
        marca.setFechaRegistro(LocalDateTime.now());
        return marcaMapper.toResponse(marcaRepository.save(marca));
    }

    public MarcaResponse update(Integer id, MarcaRequest request) {
        Marca marca = obtenerMarcaOFallar(id);
        marcaRepository.findByNombre(request.nombre())
                .filter(m -> !m.getIdMarca().equals(id))
                .ifPresent(m -> { throw new BadRequestException("Ese nombre ya lo tiene otra marca"); });
        marcaMapper.updateEntity(request, marca);
        return marcaMapper.toResponse(marcaRepository.save(marca));
    }

    public void delete(Integer id) {
        Marca marca = obtenerMarcaOFallar(id);
        marca.setActivo(false);
        marcaRepository.save(marca);
    }


    private Marca obtenerMarcaOFallar(Integer id) {
        return marcaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada con id: " + id));
    }
}