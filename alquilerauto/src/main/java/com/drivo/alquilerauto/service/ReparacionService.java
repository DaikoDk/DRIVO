package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.request.ReparacionCreateRequest;
import com.drivo.alquilerauto.entity.Auto;
import com.drivo.alquilerauto.entity.CatalogoReparacion;
import com.drivo.alquilerauto.entity.Reparacion;
import com.drivo.alquilerauto.entity.Reserva;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.repository.AutoRepository;
import com.drivo.alquilerauto.repository.CatalogoReparacionRepository;
import com.drivo.alquilerauto.repository.ReparacionRepository;
import com.drivo.alquilerauto.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReparacionService {

    private final ReparacionRepository repository;
    private final ReservaRepository reservaRepository;
    private final AutoRepository autoRepository;
    private final CatalogoReparacionRepository catalogoRepository;

    @Transactional(readOnly = true)
    public List<Reparacion> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Reparacion findById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reparación no encontrada"));
    }

    @Transactional(readOnly = true)
    public List<Reparacion> findByReserva(Integer idReserva) {
        return repository.findByReservaIdReserva(idReserva);
    }

    @Transactional(readOnly = true)
    public List<Reparacion> findByAuto(Integer idAuto) {
        return repository.findByAutoIdAuto(idAuto);
    }

    public Reparacion create(ReparacionCreateRequest request) {
        Reserva reserva = reservaRepository.findById(request.idReserva())
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada"));
        Auto auto = autoRepository.findById(request.idAuto())
                .orElseThrow(() -> new ResourceNotFoundException("Auto no encontrado"));

        Reparacion reparacion = new Reparacion();
        reparacion.setReserva(reserva);
        reparacion.setAuto(auto);
        reparacion.setDescripcion(request.descripcion());
        reparacion.setCosto(request.costo());
        reparacion.setResponsable(request.responsable());
        reparacion.setUsuarioReporte(request.usuarioReporte());

        if (request.idCatalogoReparacion() != null) {
            CatalogoReparacion catalogo = catalogoRepository.findById(request.idCatalogoReparacion())
                    .orElseThrow(() -> new ResourceNotFoundException("Catálogo de reparación no encontrado"));
            reparacion.setCatalogoReparacion(catalogo);
        }

        Reparacion saved = repository.save(reparacion);

        Reserva r = reservaRepository.findById(request.idReserva()).get();
        r.setCostoReparaciones(r.getCostoReparaciones().add(request.costo()));
        r.setTotal(r.getTotal().add(request.costo()));
        reservaRepository.save(r);

        return saved;
    }

    public Reparacion updateEstado(Integer id, String estado) {
        Reparacion reparacion = findById(id);
        reparacion.setEstado(estado);
        if ("Completada".equals(estado)) {
            reparacion.setFechaFin(java.time.LocalDateTime.now());
        }
        return repository.save(reparacion);
    }
}
