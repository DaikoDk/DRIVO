package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.request.ReservaCreateRequest;
import com.drivo.alquilerauto.dto.request.ReservaFinalizarRequest;
import com.drivo.alquilerauto.entity.*;
import com.drivo.alquilerauto.exception.BadRequestException;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final AutoRepository autoRepository;
    private final ClienteRepository clienteRepository;
    private final HistorialKilometrajeRepository historialKmRepository;

    @Transactional(readOnly = true)
    public List<Reserva> findAll() {
        return reservaRepository.findAllWithDetails();
    }

    @Transactional(readOnly = true)
    public Reserva findById(Integer id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Reserva> findByCliente(Integer idCliente) {
        return reservaRepository.findByClienteIdCliente(idCliente);
    }

    @Transactional(readOnly = true)
    public List<Reserva> findByEstado(String estado) {
        return reservaRepository.findByEstado(estado);
    }

    @Transactional(readOnly = true)
    public List<Reserva> findActivas() {
        return reservaRepository.findByEstadoInWithDetails(
                List.of("Pendiente", "Confirmada", "En proceso"));
    }

    public Reserva create(ReservaCreateRequest request) {
        Cliente cliente = clienteRepository.findById(request.idCliente())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));
        Auto auto = autoRepository.findById(request.idAuto())
                .orElseThrow(() -> new ResourceNotFoundException("Auto no encontrado"));

        if (cliente.getBloqueado()) {
            throw new BadRequestException("El cliente está bloqueado y no puede realizar reservas");
        }

        if (!"Disponible".equals(auto.getEstado())) {
            throw new BadRequestException("El auto no está disponible (estado: " + auto.getEstado() + ")");
        }

        List<Reserva> solapadas = reservaRepository.findReservasSolapadas(
                request.idAuto(), request.fechaInicio(), request.fechaFin(), null);
        if (!solapadas.isEmpty()) {
            throw new BadRequestException("El auto ya tiene una reserva en ese rango de fechas");
        }

        if (request.fechaFin().isBefore(request.fechaInicio())) {
            throw new BadRequestException("La fecha de fin debe ser posterior a la fecha de inicio");
        }

        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setAuto(auto);
        reserva.setFechaInicio(request.fechaInicio());
        reserva.setHoraInicio(request.horaInicio());
        reserva.setFechaFin(request.fechaFin());
        reserva.setHoraFin(request.horaFin());
        reserva.setSubtotal(request.subtotal());
        reserva.setTotal(request.total());
        reserva.setEstado("Confirmada");
        reserva.setUsuarioCreacion(request.usuarioCreacion());

        reserva = reservaRepository.save(reserva);

        auto.setEstado("Reservado");
        autoRepository.save(auto);

        cliente.setNumeroReservas(cliente.getNumeroReservas() + 1);
        clienteRepository.save(cliente);

        return reserva;
    }

    public Reserva finalizar(Integer idReserva, ReservaFinalizarRequest request) {
        Reserva reserva = findById(idReserva);

        if ("Finalizada".equals(reserva.getEstado())) {
            throw new BadRequestException("La reserva ya está finalizada");
        }
        if ("Cancelada".equals(reserva.getEstado())) {
            throw new BadRequestException("No se puede finalizar una reserva cancelada");
        }

        Auto auto = reserva.getAuto();

        reserva.setEstado("Finalizada");
        reserva.setEstadoEntrega(request.estadoEntrega());
        reserva.setKilometrajeFin(request.kilometrajeFin());
        reserva.setObservacionesEntrega(request.observaciones());
        reserva.setFechaHoraFinReal(java.time.LocalDateTime.now());
        reserva.setFechaFinalizacion(java.time.LocalDateTime.now());
        reserva.setUsuarioFinalizacion(request.usuario());
        reservaRepository.save(reserva);

        auto.setKilometrajeActual(request.kilometrajeFin());
        auto.setEstado("Disponible");
        autoRepository.save(auto);

        if (reserva.getKilometrajeInicio() != null) {
            HistorialKilometraje historial = new HistorialKilometraje();
            historial.setAuto(auto);
            historial.setReserva(reserva);
            historial.setKilometrajeAnterior(reserva.getKilometrajeInicio());
            historial.setKilometrajeNuevo(request.kilometrajeFin());
            historial.setTipoRegistro("Reserva");
            historial.setUsuarioRegistro(request.usuario());
            historialKmRepository.save(historial);
        }

        return reserva;
    }

    public Reserva cancelar(Integer idReserva, String usuario) {
        Reserva reserva = findById(idReserva);

        if ("Finalizada".equals(reserva.getEstado())) {
            throw new BadRequestException("No se puede cancelar una reserva ya finalizada");
        }

        reserva.setEstado("Cancelada");
        reserva.setUsuarioFinalizacion(usuario);
        reserva.setFechaFinalizacion(java.time.LocalDateTime.now());
        reservaRepository.save(reserva);

        Auto auto = reserva.getAuto();
        if ("Reservado".equals(auto.getEstado()) || "En proceso".equals(auto.getEstado())) {
            auto.setEstado("Disponible");
            autoRepository.save(auto);
        }

        return reserva;
    }

    @Transactional(readOnly = true)
    public long countReservasHoy() {
        return reservaRepository.countReservasHoy();
    }

    @Transactional(readOnly = true)
    public java.math.BigDecimal sumIngresosMesActual() {
        return reservaRepository.sumIngresosMesActual();
    }
}
