package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.request.ReparacionCreateRequest;
import com.drivo.alquilerauto.dto.request.ReparacionEstadoRequest;
import com.drivo.alquilerauto.dto.response.ReparacionResponse;
import com.drivo.alquilerauto.entity.Auto;
import com.drivo.alquilerauto.entity.CatalogoReparacion;
import com.drivo.alquilerauto.entity.Reparacion;
import com.drivo.alquilerauto.entity.Reserva;
import com.drivo.alquilerauto.exception.BadRequestException;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.mapper.ReparacionMapper;
import com.drivo.alquilerauto.repository.AutoRepository;
import com.drivo.alquilerauto.repository.CatalogoReparacionRepository;
import com.drivo.alquilerauto.repository.ReparacionRepository;
import com.drivo.alquilerauto.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReparacionService {

    private final ReparacionRepository repository;
    private final ReservaRepository reservaRepository;
    private final AutoRepository autoRepository;
    private final CatalogoReparacionRepository catalogoRepository;
    private final ReparacionMapper mapper;

    @Transactional(readOnly = true)
    public List<ReparacionResponse> findAll() {
        return mapper.toResponseList(repository.findAll());
    }

    @Transactional(readOnly = true)
    public List<ReparacionResponse> findByEstado(String estado) {
        return mapper.toResponseList(repository.findByEstado(estado));
    }

    @Transactional(readOnly = true)
    public ReparacionResponse findById(Integer id) {
        Reparacion reparacion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reparación no encontrada con id: " + id));
        return mapper.toResponse(reparacion);
    }

    @Transactional(readOnly = true)
    public List<ReparacionResponse> findByReserva(Integer idReserva) {
        return mapper.toResponseList(repository.findByReservaIdReserva(idReserva));
    }

    @Transactional(readOnly = true)
    public List<ReparacionResponse> findByAuto(Integer idAuto) {
        return mapper.toResponseList(repository.findByAutoIdAuto(idAuto));
    }

    public ReparacionResponse create(ReparacionCreateRequest request) {
        Reserva reserva = reservaRepository.findById(request.idReserva())
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con id: " + request.idReserva()));
        Auto auto = autoRepository.findById(request.idAuto())
                .orElseThrow(() -> new ResourceNotFoundException("Auto no encontrado con id: " + request.idAuto()));

        Reparacion reparacion = new Reparacion();
        reparacion.setReserva(reserva);
        reparacion.setAuto(auto);
        reparacion.setDescripcion(request.descripcion());
        reparacion.setCosto(request.costo());
        reparacion.setResponsable(request.responsable());
        reparacion.setUsuarioReporte(request.usuarioReporte());
        reparacion.setFechaReporte(LocalDateTime.now());

        if (request.idCatalogoReparacion() != null) {
            CatalogoReparacion catalogo = catalogoRepository.findById(request.idCatalogoReparacion())
                    .orElseThrow(() -> new ResourceNotFoundException("Catálogo de reparación no encontrado"));
            reparacion.setCatalogoReparacion(catalogo);
        }

        Reparacion saved = repository.save(reparacion);

        if (!"En reparación".equals(auto.getEstado())) {
            auto.setEstado("En reparación");
            autoRepository.save(auto);
        }

        return mapper.toResponse(saved);
    }

    public ReparacionResponse updateEstado(Integer id, ReparacionEstadoRequest request) {
        Reparacion reparacion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reparación no encontrada con id: " + id));

        if ("Completada".equals(reparacion.getEstado())) {
            throw new BadRequestException("No se puede modificar una reparación completada");
        }

        String estado = request.estado();
        if (!estado.equals("Pendiente") && !estado.equals("En proceso")
                && !estado.equals("Completada") && !estado.equals("Cancelada")) {
            throw new BadRequestException("Estado no válido: " + estado);
        }

        reparacion.setEstado(estado);
        if ("Completada".equals(estado)) {
            reparacion.setFechaFin(LocalDateTime.now());
        }
        Reparacion saved = repository.save(reparacion);

        if ("Completada".equals(estado) || "Cancelada".equals(estado)) {
            Auto auto = saved.getAuto();
            List<Reparacion> pendientes = repository.findByAutoIdAuto(auto.getIdAuto())
                    .stream()
                    .filter(r -> !"Completada".equals(r.getEstado()) && !"Cancelada".equals(r.getEstado()))
                    .toList();
            if (pendientes.isEmpty() && "En reparación".equals(auto.getEstado())) {
                auto.setEstado("Disponible");
                autoRepository.save(auto);
            }
        }

        return mapper.toResponse(saved);
    }
}
