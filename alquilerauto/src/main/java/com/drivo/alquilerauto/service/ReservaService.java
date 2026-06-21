package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.request.ReparacionItemRequest;
import com.drivo.alquilerauto.dto.request.ReservaCreateRequest;
import com.drivo.alquilerauto.dto.request.ReservaFinalizarRequest;
import com.drivo.alquilerauto.dto.request.ReservaPortalRequest;
import com.drivo.alquilerauto.dto.response.BufferCheckResponse;
import com.drivo.alquilerauto.dto.response.ReservaResponse;
import com.drivo.alquilerauto.entity.*;
import com.drivo.alquilerauto.exception.BadRequestException;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.mapper.ReservaMapper;
import com.drivo.alquilerauto.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ReservaService {

    private static final String PENDIENTE  = "RESERVA_PENDIENTE";
    private static final String CONFIRMADA = "RESERVA_CONFIRMADA";
    private static final String CANCELADA  = "RESERVA_CANCELADA";
    private static final String EXPIRADA   = "RESERVA_EXPIRADA";
    static final String EN_CURSO   = "ALQUILER_EN_CURSO";
    static final String EN_DEMORA  = "ALQUILER_EN_DEMORA";
    static final String ENTREGADO  = "ALQUILER_ENTREGADO";
    private static final String FINALIZADO = "ALQUILER_FINALIZADO";

    private final ReservaRepository reservaRepository;
    private final AutoRepository autoRepository;
    private final ClienteRepository clienteRepository;
    private final HistorialKilometrajeRepository historialKmRepository;
    private final ReparacionRepository reparacionRepository;
    private final CatalogoReparacionRepository catalogoReparacionRepository;
    private final EstadoRepository estadoRepository;
    private final ReservaMapper reservaMapper;
    private final HoldService holdService;

    private Estado est(String codigo) {
        return estadoRepository.findByCodigo(codigo)
                .orElseThrow(() -> new IllegalStateException("Estado no encontrado: " + codigo));
    }

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
        return reservaRepository.findByEstadoInWithDetails(List.of(EN_CURSO));
    }

    @Transactional(readOnly = true)
    public BufferCheckResponse bufferCheck(Integer idAuto, LocalDate fechaInicio, LocalTime horaInicio) {
        LocalDateTime inicioNueva = LocalDateTime.of(fechaInicio, horaInicio);
        List<Reserva> activas = reservaRepository.findByAutoIdAuto(idAuto).stream()
                .filter(r -> PENDIENTE.equals(r.getEstado().getCodigo())
                        || CONFIRMADA.equals(r.getEstado().getCodigo())
                        || EN_CURSO.equals(r.getEstado().getCodigo())
                        || EN_DEMORA.equals(r.getEstado().getCodigo()))
                .toList();
        if (activas.isEmpty()) {
            return new BufferCheckResponse(false, null, 24, null, null);
        }
        Reserva conflicto = null;
        LocalDateTime finConflicto = LocalDateTime.MIN;
        for (Reserva r : activas) {
            LocalDateTime finExistente = LocalDateTime.of(r.getFechaFin(), r.getHoraFin());
            if (!finExistente.isBefore(inicioNueva) || ChronoUnit.HOURS.between(finExistente, inicioNueva) < 24) {
                if (finExistente.isAfter(finConflicto)) {
                    finConflicto = finExistente;
                    conflicto = r;
                }
            }
        }
        if (conflicto == null) {
            return new BufferCheckResponse(false, null, 24, null, null);
        }
        long horas = ChronoUnit.HOURS.between(finConflicto, inicioNueva);
        LocalDateTime inicioAjustado = finConflicto.plusHours(24);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        String mensaje = String.format(
                "El vehiculo %s tiene una reserva activa que finaliza el %s a las %s. " +
                "Se requiere un margen minimo de 24h desde la entrega. " +
                "La fecha de inicio se ajusto automaticamente al %s a las %s. " +
                "Si el vehiculo no estuviera disponible a tiempo, te asignaremos otro similar.",
                conflicto.getAuto().getPlaca(),
                conflicto.getFechaFin().format(fmt),
                conflicto.getHoraFin(),
                inicioAjustado.toLocalDate().format(fmt),
                inicioAjustado.toLocalTime());
        return new BufferCheckResponse(true, mensaje, Math.max(0, horas),
                conflicto.getFechaFin(), conflicto.getHoraFin());
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

        String estadoOriginal = holdService.getEstadoOriginal(request.idAuto());
        if ("Disponible".equals(estadoOriginal) && !holdService.isValid(request.idAuto())) {
            throw new BadRequestException("El tiempo de reserva expiro. Seleccione el auto nuevamente");
        }

        String estadoActual = auto.getEstado();
        if (!"Reservado".equals(estadoActual) && !"En proceso".equals(estadoActual)) {
            log.warn("create() rechazado: auto {} estado={}", request.idAuto(), estadoActual);
            throw new BadRequestException("Auto no disponible (estado actual: " + estadoActual + ")");
        }

        List<Reserva> solapadas = reservaRepository.findReservasSolapadas(
                request.idAuto(), request.fechaInicio(), request.fechaFin(), null);
        if (!solapadas.isEmpty()) {
            log.warn("create() rechazado: auto {} solapado con reservas {}", request.idAuto(),
                    solapadas.stream().map(r -> "#" + r.getIdReserva() + "(" + r.getFechaInicio() + "\u2192" + r.getFechaFin() + ")").toList());
            throw new BadRequestException("Auto no disponible en ese rango: ya tiene reservas activas en esas fechas");
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
        reserva.setKilometrajeInicio(auto.getKilometrajeActual());
        reserva.setEstadoEntrega("Sin entregar");
        reserva.setFechaCreacion(LocalDateTime.now());

        boolean inicioInmediato = !request.fechaInicio().isAfter(LocalDate.now())
                && (request.fechaInicio().isAfter(LocalDate.now()) || !request.horaInicio().isAfter(LocalTime.now()));
        if (inicioInmediato) {
            reserva.setEstado(est(EN_CURSO));
            reserva.setFechaHoraInicioReal(LocalDateTime.now());
            auto.setEstado("En proceso");
        } else {
            reserva.setEstado(est(CONFIRMADA));
            auto.setEstado("Reservado");
        }

        reserva = reservaRepository.save(reserva);
        autoRepository.save(auto);

        cliente.setNumeroReservas(cliente.getNumeroReservas() + 1);
        clienteRepository.save(cliente);

        holdService.release(request.idAuto());

        return reservaMapper.toResponse(reserva);
    }

    @Transactional
    public void autoIniciarConfirmadas() {
        LocalDate hoy = LocalDate.now();
        LocalTime ahora = LocalTime.now();
        List<Reserva> candidatas = reservaRepository.findConfirmadasParaIniciar(hoy);
        for (Reserva reserva : candidatas) {
            if (reserva.getFechaInicio().equals(hoy) && reserva.getHoraInicio().isAfter(ahora)) {
                continue;
            }
            Auto auto = reserva.getAuto();
            reserva.setEstado(est(EN_CURSO));
            reserva.setKilometrajeInicio(auto.getKilometrajeActual());
            reserva.setFechaHoraInicioReal(LocalDateTime.now());
            reservaRepository.save(reserva);
            auto.setEstado("En proceso");
            autoRepository.save(auto);
        }
    }

    @Transactional
    public void autoDemorarVencidas() {
        List<Reserva> enCurso = reservaRepository.findByEstado(EN_CURSO);
        LocalDateTime now = LocalDateTime.now();
        for (Reserva r : enCurso) {
            LocalDateTime plannedEnd = LocalDateTime.of(r.getFechaFin(), r.getHoraFin());
            if (now.isAfter(plannedEnd)) {
                r.setEstado(est(EN_DEMORA));
                r.setFechaHoraFinReal(now);
                long horasRetraso = ChronoUnit.HOURS.between(plannedEnd, now);
                long diasRetraso = (horasRetraso + 23) / 24;
                BigDecimal mora = r.getAuto().getMoraPorDia().multiply(BigDecimal.valueOf(diasRetraso));
                r.setMora(mora);
                r.setTotal(r.getSubtotal().add(mora).add(r.getCostoReparaciones()));
                reservaRepository.save(r);
                log.info("Reserva #{} auto-demorada: {} horas de retraso, S/{} de mora", r.getIdReserva(), horasRetraso, mora);
            }
        }
    }

    public ReservaResponse entregar(Integer idReserva, ReservaFinalizarRequest request) {
        Reserva reserva = findById(idReserva);
        String estadoActual = reserva.getEstado().getCodigo();
        if (!EN_CURSO.equals(estadoActual) && !EN_DEMORA.equals(estadoActual)) {
            throw new BadRequestException("Solo se puede entregar una reserva En curso o En demora");
        }
        if (request.kilometrajeFin() < reserva.getKilometrajeInicio()) {
            throw new BadRequestException("El kilometraje final no puede ser menor al kilometraje inicial");
        }

        Auto auto = reserva.getAuto();
        LocalDateTime now = LocalDateTime.now();

        // si no estaba en demora, calcular mora al entregar
        if (!EN_DEMORA.equals(estadoActual)) {
            LocalDateTime plannedEnd = LocalDateTime.of(reserva.getFechaFin(), reserva.getHoraFin());
            if (now.isAfter(plannedEnd)) {
                long horasRetraso = ChronoUnit.HOURS.between(plannedEnd, now);
                long diasRetraso = (horasRetraso + 23) / 24;
                BigDecimal mora = auto.getMoraPorDia().multiply(BigDecimal.valueOf(diasRetraso));
                reserva.setMora(mora);
            }
        }

        reserva.setFechaHoraFinReal(now);
        reserva.setKilometrajeFin(request.kilometrajeFin());
        reserva.setEstadoEntrega(request.estadoEntrega());
        reserva.setObservacionesEntrega(request.observaciones());

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
                            .orElseThrow(() -> new ResourceNotFoundException("Catalogo no encontrado"));
                    reparacion.setCatalogoReparacion(catalogo);
                }
                reparacionRepository.saveAndFlush(reparacion);
                costoReparaciones = costoReparaciones.add(item.costo());
            }
        }
        reserva.setCostoReparaciones(costoReparaciones);
        reserva.setTotal(reserva.getSubtotal().add(reserva.getMora()).add(costoReparaciones));
        reserva.setEstado(est(ENTREGADO));
        reservaRepository.save(reserva);

        // actualizar auto
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

        boolean tienePendientes = request.reparaciones() != null &&
                request.reparaciones().stream().anyMatch(r -> !"Completada".equals(r.estado()));
        boolean tieneConfirmadas = reservaRepository.findByAutoIdAuto(auto.getIdAuto())
                .stream().anyMatch(r -> CONFIRMADA.equals(r.getEstado().getCodigo()));
        if (tienePendientes) {
            auto.setEstado("En reparación");
        } else if (tieneConfirmadas) {
            auto.setEstado("Reservado");
        } else {
            auto.setEstado("Disponible");
        }
        autoRepository.save(auto);

        return reservaMapper.toResponse(reserva);
    }

    public ReservaResponse finalizarPago(Integer idReserva) {
        Reserva reserva = findById(idReserva);
        if (!ENTREGADO.equals(reserva.getEstado().getCodigo())) {
            throw new BadRequestException("La reserva debe estar en estado ALQUILER_ENTREGADO para procesar el pago");
        }
        reserva.setEstado(est(FINALIZADO));
        reserva.setFechaFinalizacion(LocalDateTime.now());
        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) reserva.setUsuarioFinalizacion(auth.getName());
        reservaRepository.save(reserva);
        return reservaMapper.toResponse(reserva);
    }

    public ReservaResponse finalizar(Integer idReserva, ReservaFinalizarRequest request) {
        Reserva reserva = findById(idReserva);

        if (!EN_CURSO.equals(reserva.getEstado().getCodigo())) {
            throw new BadRequestException("Solo se puede finalizar una reserva En curso");
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
                                    "Catalogo de reparacion no encontrado con id: " + item.idCatalogoReparacion()));
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
        reserva.setEstado(est(FINALIZADO));
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

        boolean tienePendientes = request.reparaciones() != null &&
                request.reparaciones().stream().anyMatch(r -> !"Completada".equals(r.estado()));
        boolean tieneConfirmadas = reservaRepository.findByAutoIdAuto(auto.getIdAuto())
                .stream().anyMatch(r -> CONFIRMADA.equals(r.getEstado().getCodigo()));
        if (tienePendientes) {
            auto.setEstado("En reparación");
        } else if (tieneConfirmadas) {
            auto.setEstado("Reservado");
        } else {
            auto.setEstado("Disponible");
        }
        autoRepository.save(auto);

        return reservaMapper.toResponse(reserva);
    }

    public ReservaResponse cancelar(Integer idReserva) {
        Reserva reserva = findById(idReserva);

        Auto auto = reserva.getAuto();
        if (!PENDIENTE.equals(reserva.getEstado().getCodigo())) {
            throw new BadRequestException("No se puede cancelar: la reserva no esta Pendiente");
        }

        reserva.setEstado(est(CANCELADA));
        reserva.setFechaFinalizacion(LocalDateTime.now());
        reservaRepository.save(reserva);

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

        Auto auto = reserva.getAuto();
        if (!PENDIENTE.equals(reserva.getEstado().getCodigo())) {
            throw new BadRequestException("No se puede cancelar: la reserva no esta Pendiente");
        }

        reserva.setEstado(est(CANCELADA));
        reserva.setFechaFinalizacion(LocalDateTime.now());
        reservaRepository.save(reserva);

        auto.setEstado("Disponible");
        autoRepository.save(auto);

        return reservaMapper.toResponse(reserva);
    }
}
