package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.request.AutoRequest;
import com.drivo.alquilerauto.dto.response.AutoResponse;
import com.drivo.alquilerauto.entity.Auto;
import com.drivo.alquilerauto.entity.Marca;
import com.drivo.alquilerauto.entity.Modelo;
import com.drivo.alquilerauto.exception.BadRequestException;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.mapper.AutoMapper;
import com.drivo.alquilerauto.repository.AutoRepository;
import com.drivo.alquilerauto.repository.MarcaRepository;
import com.drivo.alquilerauto.repository.ModeloRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AutoService {

    private final AutoRepository autoRepository;
    private final MarcaRepository marcaRepository;
    private final ModeloRepository modeloRepository;
    private final AutoMapper autoMapper;

    @Transactional(readOnly = true)
    public List<AutoResponse> findAllActivos() {
        return autoMapper.toResponseList(autoRepository.findByActivoTrue());
    }

    @Transactional(readOnly = true)
    public AutoResponse findById(Integer id) {
        Auto auto = autoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auto no encontrado con id: " + id));
        return autoMapper.toResponse(auto);
    }

    @Transactional(readOnly = true)
    public List<AutoResponse> findDisponibles() {
        return autoMapper.toResponseList(autoRepository.findByActivoTrueAndEstadoIn(List.of("Disponible", "En proceso")));
    }

    @Transactional(readOnly = true)
    public List<AutoResponse> findDisponiblesEnRango(LocalDate fechaInicio, LocalDate fechaFin) {
        return autoMapper.toResponseList(autoRepository.findDisponiblesEnRango(fechaInicio, fechaFin));
    }

    public AutoResponse create(AutoRequest request) {
        if (autoRepository.existsByPlaca(request.placa())) {
            throw new BadRequestException("Ya existe un auto con la placa: " + request.placa());
        }

        Marca marca = marcaRepository.findById(request.idMarca())
                .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada con id: " + request.idMarca()));

        Modelo modelo = modeloRepository.findById(request.idModelo())
                .orElseThrow(() -> new ResourceNotFoundException("Modelo no encontrado con id: " + request.idModelo()));

        Auto auto = autoMapper.toEntity(request);
        auto.setMarca(marca);
        auto.setModelo(modelo);
        auto.setEstado("Disponible");
        auto.setActivo(true);
        auto.setFechaRegistro(LocalDateTime.now());
        if (auto.getKilometrajeActual() == null) {
            auto.setKilometrajeActual(0);
        }

        return autoMapper.toResponse(autoRepository.save(auto));
    }

    public AutoResponse update(Integer id, AutoRequest request) {
        Auto auto = obtenerAutoOFallar(id);

        if (!request.placa().equals(auto.getPlaca()) && autoRepository.existsByPlaca(request.placa())) {
            throw new BadRequestException("Ya existe otro auto con la placa: " + request.placa());
        }

        if (!request.idMarca().equals(auto.getMarca().getIdMarca())) {
            Marca nuevaMarca = marcaRepository.findById(request.idMarca())
                    .orElseThrow(() -> new ResourceNotFoundException("Marca no encontrada con id: " + request.idMarca()));
            auto.setMarca(nuevaMarca);
        }

        if (!request.idModelo().equals(auto.getModelo().getIdModelo())) {
            Modelo nuevoModelo = modeloRepository.findById(request.idModelo())
                    .orElseThrow(() -> new ResourceNotFoundException("Modelo no encontrado con id: " + request.idModelo()));
            auto.setModelo(nuevoModelo);
        }

        autoMapper.updateEntity(request, auto);
        auto.setFechaUltimaActualizacion(LocalDateTime.now());
        return autoMapper.toResponse(autoRepository.save(auto));
    }

    public Auto updateEstado(Integer id, String estado) {
        Auto auto = obtenerAutoOFallar(id);
        auto.setEstado(estado);
        return autoRepository.save(auto);
    }

    public void delete(Integer id) {
        Auto auto = obtenerAutoOFallar(id);
        auto.setActivo(false);
        autoRepository.save(auto);
    }

    private Auto obtenerAutoOFallar(Integer id) {
        return autoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auto no encontrado con id: " + id));
    }
}
