package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.response.*;
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
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final AutoRepository autoRepository;
    private final ClienteRepository clienteRepository;
    private final ReservaRepository reservaRepository;
    private final MantenimientoRepository mantenimientoRepository;

    public DashboardStatsResponse getStats() {
        long totalAutos     = autoRepository.findByActivoTrue().size();
        long disponibles    = autoRepository.findByActivoTrueAndEstado("Disponible").size();
        long totalClientes  = clienteRepository.findByActivoTrue().size();
        long reservasActivas = reservaRepository
                .findByEstadoIn(List.of("Pendiente", "Confirmada", "En proceso")).size();
        BigDecimal ingresosMes = reservaRepository.sumIngresosMesActual();
        if (ingresosMes == null) ingresosMes = BigDecimal.ZERO;

        return new DashboardStatsResponse(
                totalAutos, disponibles, totalClientes, reservasActivas, ingresosMes);
    }

    public List<ReservaHoyResponse> getReservasHoy() {
        LocalDate hoy = LocalDate.now();
        List<Reserva> reservas = reservaRepository.findByFechaInicioBetween(hoy, hoy);

        List<ReservaHoyResponse> resultado = new ArrayList<>();
        for (Reserva r : reservas) {
            resultado.add(new ReservaHoyResponse(
                    r.getIdReserva(),
                    r.getCliente().getNombre() + " " + r.getCliente().getApellidoPaterno(),
                    r.getCliente().getDni(),
                    r.getAuto().getPlaca(),
                    r.getAuto().getMarca().getNombre(),
                    r.getAuto().getModelo().getNombre(),
                    r.getFechaInicio(),
                    r.getHoraInicio(),
                    r.getFechaFin(),
                    r.getHoraFin(),
                    r.getTotal(),
                    r.getEstado()
            ));
        }
        return resultado;
    }

    public List<VehiculoMantenimientoResponse> getVehiculosEnMantenimiento() {
        List<Mantenimiento> lista = mantenimientoRepository.findByFechaSalidaIsNull();

        List<VehiculoMantenimientoResponse> resultado = new ArrayList<>();
        for (Mantenimiento m : lista) {
            resultado.add(new VehiculoMantenimientoResponse(
                    m.getIdMantenimiento(),
                    m.getAuto().getPlaca(),
                    m.getAuto().getMarca().getNombre(),
                    m.getAuto().getModelo().getNombre(),
                    m.getFechaIngreso(),
                    m.getTipo(),
                    m.getDetalle()
            ));
        }
        return resultado;
    }

    public List<IngresoMensualResponse> getIngresosMensuales() {
        List<IngresoMensualResponse> resultado = new ArrayList<>();
        LocalDate hoy = LocalDate.now();

        for (int i = 5; i >= 0; i--) {
            LocalDate primerDia = hoy.minusMonths(i).withDayOfMonth(1);
            LocalDate ultimoDia = primerDia.withDayOfMonth(primerDia.lengthOfMonth());

            List<Reserva> reservas = reservaRepository.findByFechaInicioBetween(primerDia, ultimoDia);

            BigDecimal monto = reservas.stream()
                    .filter(r -> "Finalizada".equals(r.getEstado()))
                    .map(Reserva::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String nombreMes = Month.of(primerDia.getMonthValue())
                    .getDisplayName(TextStyle.FULL, new Locale("es", "PE"));
            nombreMes = Character.toUpperCase(nombreMes.charAt(0)) + nombreMes.substring(1);

            resultado.add(new IngresoMensualResponse(
                    nombreMes,
                    primerDia.getYear(),
                    primerDia.getMonthValue(),
                    monto
            ));
        }
        return resultado;
    }
}
