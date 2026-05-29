package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.response.DashboardResponse;
import com.drivo.alquilerauto.repository.AutoRepository;
import com.drivo.alquilerauto.repository.ClienteRepository;
import com.drivo.alquilerauto.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final AutoRepository autoRepository;
    private final ClienteRepository clienteRepository;
    private final ReservaRepository reservaRepository;

    public DashboardResponse getResumen() {
        List<com.drivo.alquilerauto.entity.Auto> autos = autoRepository.findByActivoTrue();

        long totalAutos = autos.size();
        long autosDisponibles = autos.stream().filter(a -> "Disponible".equals(a.getEstado())).count();
        long autosAlquilados = autos.stream().filter(a -> "Reservado".equals(a.getEstado()) || "En proceso".equals(a.getEstado())).count();
        long autosMantenimiento = autos.stream().filter(a -> "En reparación".equals(a.getEstado())).count();

        long totalClientes = clienteRepository.findByActivoTrue().size();
        long clientesActivos = clienteRepository.findByActivoTrueAndEstado("activo").size();

        long reservasActivas = reservaRepository.findByEstadoIn(
                List.of("Pendiente", "Confirmada", "En proceso")).size();
        long reservasHoy = reservaRepository.countReservasHoy();
        BigDecimal ingresosMes = reservaRepository.sumIngresosMesActual();

        return new DashboardResponse(totalAutos, autosDisponibles, autosAlquilados,
                autosMantenimiento, totalClientes, clientesActivos, reservasActivas,
                reservasHoy, ingresosMes);
    }
}
