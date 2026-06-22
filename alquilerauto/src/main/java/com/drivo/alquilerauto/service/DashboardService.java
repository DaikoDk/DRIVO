package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.response.DashboardResponse;
import com.drivo.alquilerauto.dto.response.IngresoMensualResponse;
import com.drivo.alquilerauto.dto.response.ReservaHoyResponse;
import com.drivo.alquilerauto.dto.response.VehiculoMantenimientoResponse;
import com.drivo.alquilerauto.entity.Mantenimiento;
import com.drivo.alquilerauto.entity.Reserva;
import com.drivo.alquilerauto.repository.AutoRepository;
import com.drivo.alquilerauto.repository.ClienteRepository;
import com.drivo.alquilerauto.repository.MantenimientoRepository;
import com.drivo.alquilerauto.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final AutoRepository autoRepository;
    private final ClienteRepository clienteRepository;
    private final ReservaRepository reservaRepository;
    private final MantenimientoRepository mantenimientoRepository;

    public DashboardResponse getResumen() {
        List<com.drivo.alquilerauto.entity.Auto> autos = autoRepository.findByActivoTrue();

        long totalAutos = autos.size();
        long autosDisponibles = autos.stream().filter(a -> "Disponible".equals(a.getEstado())).count();
        long autosAlquilados = autos.stream().filter(a -> "Reservado".equals(a.getEstado()) || "En proceso".equals(a.getEstado())).count();
        long autosMantenimiento = autos.stream().filter(a -> "En reparación".equals(a.getEstado())).count();

        long totalClientes = clienteRepository.findByActivoTrue().size();
        long clientesActivos = clienteRepository.findByActivoTrueAndEstado("activo").size();

        long reservasActivas = reservaRepository.findByEstadoInWithDetails(
                List.of("RESERVA_PENDIENTE", "RESERVA_CONFIRMADA", "ALQUILER_EN_CURSO")).size();
        long reservasHoy = reservaRepository.countReservasHoy();
        BigDecimal ingresosMes = reservaRepository.sumIngresosMesActual(
                LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0),
                LocalDateTime.now().plusMonths(1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0));

        return new DashboardResponse(totalAutos, autosDisponibles, autosAlquilados,
                autosMantenimiento, totalClientes, clientesActivos, reservasActivas,
                reservasHoy, ingresosMes);
    }

    public List<ReservaHoyResponse> getReservasHoy() {
        List<Reserva> reservas = reservaRepository.findReservasHoy();
        List<ReservaHoyResponse> result = new ArrayList<>();
        for (Reserva r : reservas) {
            result.add(new ReservaHoyResponse(
                    r.getIdReserva(),
                    r.getCliente().getNombre() + " " + r.getCliente().getApellidoPaterno(),
                    r.getAuto().getPlaca(),
                    r.getAuto().getMarca().getNombre(),
                    r.getAuto().getModelo().getNombre(),
                    r.getFechaInicio(),
                    r.getHoraInicio(),
                    r.getFechaFin(),
                    r.getHoraFin(),
                    r.getEstado().getCodigo(),
                    r.getTotal()
            ));
        }
        return result;
    }

    public List<VehiculoMantenimientoResponse> getVehiculosMantenimiento() {
        List<Mantenimiento> mantenimientos = mantenimientoRepository.findEnCursoConAuto();
        List<VehiculoMantenimientoResponse> result = new ArrayList<>();
        for (Mantenimiento m : mantenimientos) {
            result.add(new VehiculoMantenimientoResponse(
                    m.getIdMantenimiento(),
                    m.getAuto().getPlaca(),
                    m.getAuto().getModelo().getNombre(),
                    m.getFechaIngreso(),
                    m.getTipo()
            ));
        }
        return result;
    }

    public List<IngresoMensualResponse> getIngresosMensuales() {
        java.time.LocalDate hoy = java.time.LocalDate.now();
        LocalDateTime desde = hoy.minusMonths(5).withDayOfMonth(1).atStartOfDay();
        List<Reserva> reservas = reservaRepository.findFinalizadasDesde(desde);

        Map<YearMonth, BigDecimal> porMes = reservas.stream()
                .filter(r -> r.getFechaFinalizacion() != null)
                .collect(Collectors.groupingBy(
                        r -> YearMonth.from(r.getFechaFinalizacion()),
                        LinkedHashMap::new,
                        Collectors.reducing(BigDecimal.ZERO, Reserva::getTotal, BigDecimal::add)));

        List<IngresoMensualResponse> result = new ArrayList<>();
        YearMonth cursor = YearMonth.from(hoy).minusMonths(5);
        YearMonth actual = YearMonth.from(hoy);
        while (!cursor.isAfter(actual)) {
            BigDecimal monto = porMes.getOrDefault(cursor, BigDecimal.ZERO);
            result.add(new IngresoMensualResponse(cursor.toString(), monto));
            cursor = cursor.plusMonths(1);
        }
        return result;
    }
}
