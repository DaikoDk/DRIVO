package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.request.MantenimientoCreateRequest;
import com.drivo.alquilerauto.entity.Auto;
import com.drivo.alquilerauto.entity.Mantenimiento;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.repository.AutoRepository;
import com.drivo.alquilerauto.repository.MantenimientoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MantenimientoService {

    private final MantenimientoRepository repository;
    private final AutoRepository autoRepository;

    @Transactional(readOnly = true)
    public List<Mantenimiento> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Mantenimiento findById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mantenimiento no encontrado"));
    }

    @Transactional(readOnly = true)
    public List<Mantenimiento> findByAuto(Integer idAuto) {
        return repository.findByAutoIdAuto(idAuto);
    }

    @Transactional(readOnly = true)
    public List<Mantenimiento> findPendientes() {
        return repository.findByFechaSalidaIsNull();
    }

    public Mantenimiento create(MantenimientoCreateRequest request) {
        Auto auto = autoRepository.findById(request.idAuto())
                .orElseThrow(() -> new ResourceNotFoundException("Auto no encontrado"));

        Mantenimiento mantenimiento = new Mantenimiento();
        mantenimiento.setAuto(auto);
        mantenimiento.setFechaIngreso(request.fechaIngreso());
        mantenimiento.setFechaSalida(request.fechaSalida());
        mantenimiento.setTipo(request.tipo());
        mantenimiento.setCosto(request.costo());
        mantenimiento.setDetalle(request.detalle());

        Mantenimiento saved = repository.save(mantenimiento);

        if (request.fechaSalida() == null) {
            auto.setEstado("En reparación");
            autoRepository.save(auto);
        }

        return saved;
    }

    public Mantenimiento finalizar(Integer id, java.time.LocalDate fechaSalida, String detalle) {
        Mantenimiento mantenimiento = findById(id);
        mantenimiento.setFechaSalida(fechaSalida);
        if (detalle != null) {
            mantenimiento.setDetalle(detalle);
        }
        Mantenimiento saved = repository.save(mantenimiento);

        Auto auto = mantenimiento.getAuto();
        auto.setEstado("Disponible");
        autoRepository.save(auto);

        return saved;
    }
}
