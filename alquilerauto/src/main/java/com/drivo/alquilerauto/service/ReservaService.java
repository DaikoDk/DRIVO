package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.request.IniciarRequest;
import com.drivo.alquilerauto.dto.request.ReparacionItemRequest;
import com.drivo.alquilerauto.dto.request.ReservaCreateRequest;
import com.drivo.alquilerauto.dto.request.ReservaFinalizarRequest;
import com.drivo.alquilerauto.dto.request.ReservaPortalRequest;
import com.drivo.alquilerauto.dto.response.ReservaResponse;
import com.drivo.alquilerauto.entity.*;
import com.drivo.alquilerauto.exception.BadRequestException;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.mapper.ReservaMapper;
import com.drivo.alquilerauto.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final AutoRepository autoRepository;
    private final ClienteRepository clienteRepository;
    private final HistorialKilometrajeRepository historialKmRepository;
    private final ReparacionRepository reparacionRepository;
    private final CatalogoReparacionRepository catalogoReparacionRepository;
    private final ReservaMapper reservaMapper;

    @Transactional(readOnly = true)
    public List<Reserva> findAllWithDetails() {
        return reservaRepository.findAllWithDetails();
    }

    @Transactional(readOnly = true)
    public Reserva findById(Integer id) {
        return reservaRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Reserva> findByEstado(String estado) {
        return reservaRepository.findByEstadoWithDetails(estado);
    }

    @Transactional(readOnly = true)
    public List<Reserva> findByCliente(Integer idCliente) {
        return reservaRepository.findByClienteIdClienteWithDetails(idCliente);
    }

    @Transactional(readOnly = true)
    public List<Reserva> findActivas() {
        return reservaRepository.findByEstadoInWithDetails(
                List.of("En proceso"));
    }

    public ReservaResponse create(ReservaCreateRequest request) {
        if (request.fechaFin().isBefore(request.fechaInicio())) {
            throw new BadRequestException("La fecha de fin debe ser posterior a la fecha de inicio");
        }
        if (request.fechaFin().equals(request.fechaInicio()) && !request.horaFin().isAfter(request.horaInicio())) {
            throw new BadRequestException("La hora de fin debe ser posterior a la hora de inicio");
        }

        Cliente cliente = clienteRepository.findById(request.idCliente())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + request.idCliente()));

        if (cliente.getBloqueado()) {
            throw new BadRequestException("Cliente bloqueado");
        }

        Auto auto = autoRepository.findById(request.idAuto())
                .orElseThrow(() -> new ResourceNotFoundException("Auto no encontrado con id: " + request.idAuto()));

        if (!"Disponible".equals(auto.getEstado())) {
            throw new BadRequestException("Auto no disponible en ese rango");
        }

        List<Reserva> solapadas = reservaRepository.findReservasSolapadas(
                request.idAuto(), request.fechaInicio(), request.fechaFin(), null);
        if (!solapadas.isEmpty()) {
            throw new BadRequestException("Auto no disponible en ese rango");
        }

        Reserva reserva = reservaMapper.toEntity(request);
        reserva.setCliente(cliente);
        reserva.setAuto(auto);

        long dias = ChronoUnit.DAYS.between(request.fechaInicio(), request.fechaFin());
        if (dias == 0) dias = 1;

        LocalDateTime inicioDateTime = LocalDateTime.of(request.fechaInicio(), request.horaInicio());
        LocalDateTime finDateTime = LocalDateTime.of(request.fechaFin(), request.horaFin());
        long horasReales = ChronoUnit.HOURS.between(inicioDateTime, finDateTime);
        long horasNormales = dias * 24;
        long horasExtra = Math.max(0, horasReales - horasNormales);

        BigDecimal subtotal = auto.getPrecioPorDia().multiply(BigDecimal.valueOf(dias))
                .add(auto.getPrecioPorHora() != null
                        ? auto.getPrecioPorHora().multiply(BigDecimal.valueOf(horasExtra))
                        : BigDecimal.ZERO);

        reserva.setSubtotal(subtotal);
        reserva.setMora(BigDecimal.ZERO);
        reserva.setCostoReparaciones(BigDecimal.ZERO);
        reserva.setTotal(subtotal);
        reserva.setEstado("En proceso");
        reserva.setEstadoEntrega("Sin entregar");
        reserva.setKilometrajeInicio(auto.getKilometrajeActual());
        reserva.setFechaHoraInicioReal(LocalDateTime.now());
        reserva.setFechaCreacion(LocalDateTime.now());

        reserva = reservaRepository.save(reserva);

        auto.setEstado("En proceso");
        autoRepository.save(auto);

        cliente.setNumeroReservas(cliente.getNumeroReservas() + 1);
        clienteRepository.save(cliente);

        return reservaMapper.toResponse(reserva);
    }

    public ReservaResponse iniciar(Integer idReserva, IniciarRequest request) {
        Reserva reserva = findById(idReserva);

        if (!"Pendiente".equals(reserva.getEstado())) {
            throw new BadRequestException("Solo se puede iniciar una reserva Pendiente");
        }

        reserva.setKilometrajeInicio(request.kilometrajeInicio());
        reserva.setFechaHoraInicioReal(LocalDateTime.now());
        reserva.setEstado("En proceso");
        return reservaMapper.toResponse(reservaRepository.save(reserva));
    }

    public ReservaResponse finalizar(Integer idReserva, ReservaFinalizarRequest request) {
        Reserva reserva = findById(idReserva);

        if (!"En proceso".equals(reserva.getEstado())) {
            throw new BadRequestException("Solo se puede finalizar una reserva En proceso");
        }

        if (request.kilometrajeFin() < reserva.getKilometrajeInicio()) {
            throw new BadRequestException("El kilometraje final no puede ser menor al kilometraje inicial");
        }

        Auto auto = reserva.getAuto();

        LocalDateTime plannedEnd = LocalDateTime.of(reserva.getFechaFin(), reserva.getHoraFin());
        LocalDateTime now = LocalDateTime.now();

        BigDecimal mora = BigDecimal.ZERO;
        reserva.setFechaHoraFinReal(now);

        if (now.isAfter(plannedEnd)) {
            long horasRetraso = ChronoUnit.HOURS.between(plannedEnd, now);
            long diasRetraso = (horasRetraso + 23) / 24;
            mora = auto.getMoraPorDia().multiply(BigDecimal.valueOf(diasRetraso));
        }

        BigDecimal costoReparaciones = reserva.getCostoReparaciones();
        if (request.reparaciones() != null && !request.reparaciones().isEmpty()) {
            costoReparaciones = BigDecimal.ZERO;
            for (ReparacionItemRequest item : request.reparaciones()) {
                Reparacion reparacion = new Reparacion();
                reparacion.setReserva(reserva);
                reparacion.setAuto(auto);
                reparacion.setDescripcion(item.descripcion());
                reparacion.setCosto(item.costo());
                reparacion.setResponsable(item.responsable() != null ? item.responsable() : "Cliente");
                reparacion.setEstado(item.estado() != null ? item.estado() : "Pendiente");
                reparacion.setFechaReporte(now);
                reparacion.setUsuarioReporte(request.usuario());

                if (item.idCatalogoReparacion() != null) {
                    CatalogoReparacion catalogo = catalogoReparacionRepository
                            .findById(item.idCatalogoReparacion())
                            .orElseThrow(() -> new ResourceNotFoundException(
                                    "Catálogo de reparación no encontrado con id: " + item.idCatalogoReparacion()));
                    reparacion.setCatalogoReparacion(catalogo);
                }

                reparacionRepository.saveAndFlush(reparacion);
                costoReparaciones = costoReparaciones.add(item.costo());
            }
        }

        BigDecimal nuevoTotal = reserva.getSubtotal().add(mora).add(costoReparaciones);

        reserva.setKilometrajeFin(request.kilometrajeFin());
        reserva.setMora(mora);
        reserva.setCostoReparaciones(costoReparaciones);
        reserva.setTotal(nuevoTotal);
        reserva.setObservacionesEntrega(request.observaciones());
        reserva.setEstado("Finalizada");
        reserva.setEstadoEntrega(request.estadoEntrega());
        reserva.setFechaFinalizacion(now);
        reserva.setUsuarioFinalizacion(request.usuario());
        reservaRepository.save(reserva);

        HistorialKilometraje historial = new HistorialKilometraje();
        historial.setAuto(auto);
        historial.setReserva(reserva);
        historial.setKilometrajeAnterior(auto.getKilometrajeActual());
        historial.setKilometrajeNuevo(request.kilometrajeFin());
        historial.setTipoRegistro("Reserva");
        historial.setObservaciones(request.observaciones());
        historial.setFechaRegistro(now);
        historial.setUsuarioRegistro(request.usuario());
        historialKmRepository.save(historial);

        auto.setKilometrajeActual(request.kilometrajeFin());
        auto.setEstado("Disponible");
        autoRepository.save(auto);

        return reservaMapper.toResponse(reserva);
    }

    public ReservaResponse cancelar(Integer idReserva) {
        Reserva reserva = findById(idReserva);

        if (!"En proceso".equals(reserva.getEstado())) {
            throw new BadRequestException("No se puede cancelar");
        }

        reserva.setEstado("Cancelada");
        reserva.setFechaFinalizacion(LocalDateTime.now());
        reservaRepository.save(reserva);

        Auto auto = reserva.getAuto();
        auto.setEstado("Disponible");
        autoRepository.save(auto);

        return reservaMapper.toResponse(reserva);
    }

    @Transactional(readOnly = true)
    public long countReservasHoy() {
        return reservaRepository.countReservasHoy();
    }

    @Transactional(readOnly = true)
    public BigDecimal sumIngresosMesActual() {
        return reservaRepository.sumIngresosMesActual();
    }

    public ReservaResponse createDesdePortal(ReservaPortalRequest request, String correo) {
        Cliente cliente = clienteRepository.findByUsuarioCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));

        ReservaCreateRequest createReq = new ReservaCreateRequest(
                cliente.getIdCliente(),
                request.idAuto(),
                request.fechaInicio(),
                request.horaInicio(),
                request.fechaFin(),
                request.horaFin(),
                null);
        return create(createReq);
    }

    @Transactional(readOnly = true)
    public List<Reserva> findMisReservas(Integer idCliente) {
        return reservaRepository.findByClienteIdClienteWithDetails(idCliente);
    }

    public ReservaResponse cancelarDesdePortal(Integer idReserva, Integer idClienteAuth) {
        Reserva reserva = findById(idReserva);

        if (!reserva.getCliente().getIdCliente().equals(idClienteAuth)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "No puedes cancelar una reserva que no te pertenece");
        }

        if (!"En proceso".equals(reserva.getEstado())) {
            throw new BadRequestException("No se puede cancelar");
        }

        reserva.setEstado("Cancelada");
        reserva.setFechaFinalizacion(LocalDateTime.now());
        reservaRepository.save(reserva);

        Auto auto = reserva.getAuto();
        auto.setEstado("Disponible");
        autoRepository.save(auto);

        return reservaMapper.toResponse(reserva);
    }
}
