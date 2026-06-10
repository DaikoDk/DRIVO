package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.entity.Auto;
import com.drivo.alquilerauto.entity.Mantenimiento;
import com.drivo.alquilerauto.entity.Reparacion;
import com.drivo.alquilerauto.entity.Reserva;
import com.drivo.alquilerauto.repository.AutoRepository;
import com.drivo.alquilerauto.repository.HistorialKilometrajeRepository;
import com.drivo.alquilerauto.repository.MantenimientoRepository;
import com.drivo.alquilerauto.repository.ReparacionRepository;
import com.drivo.alquilerauto.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReporteService {

    private final ReservaRepository reservaRepository;
    private final AutoRepository autoRepository;
    private final MantenimientoRepository mantenimientoRepository;
    private final ReparacionRepository reparacionRepository;
    private final HistorialKilometrajeRepository historialKmRepository;

    public Map<String, Object> reporteFinanciero(LocalDate inicio, LocalDate fin) {
        List<Reserva> reservas = reservaRepository.findByFechaInicioBetween(inicio, fin);

        List<Map<String, Object>> detalle = new ArrayList<>();
        BigDecimal totalIngresos = BigDecimal.ZERO;

        for (Reserva r : reservas) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("idReserva", r.getIdReserva());
            item.put("cliente", r.getCliente().getNombre() + " " + r.getCliente().getApellidoPaterno());
            item.put("placa", r.getAuto().getPlaca());
            item.put("fechaInicio", r.getFechaInicio());
            item.put("fechaFin", r.getFechaFin());
            item.put("subtotal", r.getSubtotal());
            item.put("mora", r.getMora());
            item.put("costoReparaciones", r.getCostoReparaciones());
            item.put("total", r.getTotal());
            item.put("estado", r.getEstado());
            item.put("totalPagado", r.getPagos().stream()
                    .map(p -> p.getMontoTotalPagado()).reduce(BigDecimal.ZERO, BigDecimal::add));
            item.put("fechaFinalizacion", r.getFechaFinalizacion());
            detalle.add(item);
            totalIngresos = totalIngresos.add(r.getTotal());
        }

        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("fechaInicio", inicio);
        resultado.put("fechaFin", fin);
        resultado.put("totalReservas", reservas.size());
        resultado.put("totalIngresos", totalIngresos);
        resultado.put("detalle", detalle);
        return resultado;
    }

    public Map<String, Object> reporteOperativo(LocalDate inicio, LocalDate fin) {
        List<Auto> autos = autoRepository.findByActivoTrue();
        List<Map<String, Object>> ranking = new ArrayList<>();

        for (Auto a : autos) {
            long totalReservas = a.getReservas().stream()
                    .filter(r -> "Finalizada".equals(r.getEstado())
                            && !r.getFechaInicio().isBefore(inicio)
                            && !r.getFechaFin().isAfter(fin))
                    .count();
            BigDecimal ingresos = a.getReservas().stream()
                    .filter(r -> "Finalizada".equals(r.getEstado())
                            && !r.getFechaInicio().isBefore(inicio)
                            && !r.getFechaFin().isAfter(fin))
                    .map(Reserva::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            long kmRecorridos = historialKmRepository.findByAutoIdAutoOrderByFechaRegistroDesc(a.getIdAuto())
                    .stream().filter(h -> h.getReserva() != null
                            && !h.getReserva().getFechaInicio().isBefore(inicio)
                            && !h.getReserva().getFechaFin().isAfter(fin))
                    .mapToInt(h -> h.getDiferencia() != null ? h.getDiferencia() : 0)
                    .sum();

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("idAuto", a.getIdAuto());
            item.put("placa", a.getPlaca());
            item.put("marca", a.getMarca().getNombre());
            item.put("modelo", a.getModelo().getNombre());
            item.put("estado", a.getEstado());
            item.put("totalReservas", totalReservas);
            item.put("ingresosGenerados", ingresos);
            item.put("kmTotalesRecorridos", kmRecorridos);
            ranking.add(item);
        }

        ranking.sort((a, b) -> Long.compare((Long) b.get("totalReservas"), (Long) a.get("totalReservas")));

        List<Mantenimiento> mantenimientos = mantenimientoRepository.findByFechaIngresoBetween(inicio, fin);
        List<Reparacion> reparaciones = reparacionRepository.findAll().stream()
                .filter(r -> !r.getFechaReporte().toLocalDate().isBefore(inicio)
                        && !r.getFechaReporte().toLocalDate().isAfter(fin))
                .toList();

        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("fechaInicio", inicio);
        resultado.put("fechaFin", fin);
        resultado.put("rankingAutos", ranking);
        resultado.put("mantenimientos", mantenimientos);
        resultado.put("reparaciones", reparaciones);
        return resultado;
    }
}
