package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.request.MantenimientoCreateRequest;
import com.drivo.alquilerauto.dto.request.MantenimientoFinalizarRequest;
import com.drivo.alquilerauto.dto.response.MantenimientoResponse;
import com.drivo.alquilerauto.entity.Auto;
import com.drivo.alquilerauto.entity.Mantenimiento;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.mapper.MantenimientoMapper;
import com.drivo.alquilerauto.repository.AutoRepository;
import com.drivo.alquilerauto.repository.MantenimientoRepository;
import com.drivo.alquilerauto.repository.ReparacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MantenimientoService {

    private final MantenimientoRepository repository;
    private final AutoRepository autoRepository;
    private final ReparacionRepository reparacionRepository;
    private final MantenimientoMapper mapper;

    @Transactional(readOnly = true)
    public List<MantenimientoResponse> findAll() {
        return mapper.toResponseList(repository.findAll());
    }

    @Transactional(readOnly = true)
    public MantenimientoResponse findById(Integer id) {
        Mantenimiento mantenimiento = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mantenimiento no encontrado con id: " + id));
        return mapper.toResponse(mantenimiento);
    }

    @Transactional(readOnly = true)
    public List<MantenimientoResponse> findByAuto(Integer idAuto) {
        return mapper.toResponseList(repository.findByAutoIdAuto(idAuto));
    }

    @Transactional(readOnly = true)
    public List<MantenimientoResponse> findEnCurso() {
        return mapper.toResponseList(repository.findByFechaSalidaIsNull());
    }

    public MantenimientoResponse create(MantenimientoCreateRequest request) {
        Auto auto = autoRepository.findById(request.idAuto())
                .orElseThrow(() -> new ResourceNotFoundException("Auto no encontrado con id: " + request.idAuto()));

        Mantenimiento mantenimiento = mapper.toEntity(request);
        mantenimiento.setAuto(auto);
        if (request.fechaSalida() != null) {
            mantenimiento.setFechaSalida(request.fechaSalida());
        }

        Mantenimiento saved = repository.save(mantenimiento);

        if (request.fechaSalida() == null) {
            auto.setEstado("En reparación");
            autoRepository.save(auto);
        }

        return mapper.toResponse(saved);
    }

    public MantenimientoResponse finalizar(Integer id, MantenimientoFinalizarRequest request) {
        Mantenimiento mantenimiento = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mantenimiento no encontrado con id: " + id));

        LocalDate fechaSalida = request.fechaSalida() != null ? request.fechaSalida() : LocalDate.now();
        mantenimiento.setFechaSalida(fechaSalida);
        if (request.detalle() != null) {
            mantenimiento.setDetalle(request.detalle());
        }

        Mantenimiento saved = repository.save(mantenimiento);

        Auto auto = mantenimiento.getAuto();
        boolean tienePendientes = reparacionRepository.findByAutoIdAuto(auto.getIdAuto())
                .stream().anyMatch(r -> !"Completada".equals(r.getEstado()) && !"Cancelada".equals(r.getEstado()));
        auto.setEstado(tienePendientes ? "En reparación" : "Disponible");
        autoRepository.save(auto);

        return mapper.toResponse(saved);
    }
}
