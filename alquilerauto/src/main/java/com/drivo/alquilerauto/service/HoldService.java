package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.response.HoldResponse;
import com.drivo.alquilerauto.entity.Auto;
import com.drivo.alquilerauto.exception.BadRequestException;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.repository.AutoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class HoldService {

    private final ConcurrentHashMap<Integer, LocalDateTime> holds = new ConcurrentHashMap<>();
    private final AutoRepository autoRepository;

    @Value("${app.reserva.tiempo-maximo-minutos}")
    private int tiempoMaximo;

    @Transactional
    public HoldResponse hold(Integer idAuto) {
        Auto auto = autoRepository.findByIdWithLock(idAuto)
                .orElseThrow(() -> new ResourceNotFoundException("Auto no encontrado con id: " + idAuto));
        if (!"Disponible".equals(auto.getEstado())) {
            throw new BadRequestException("Auto no disponible en este momento");
        }
        auto.setEstado("Reservado");
        autoRepository.save(auto);
        holds.put(idAuto, LocalDateTime.now());
        log.info("Hold creado para auto {} (expira en {} min)", idAuto, tiempoMaximo);
        return new HoldResponse(LocalDateTime.now().plusMinutes(tiempoMaximo));
    }

    public void release(Integer idAuto) {
        holds.remove(idAuto);
    }

    public boolean isValid(Integer idAuto) {
        LocalDateTime fechaHold = holds.get(idAuto);
        return fechaHold != null && fechaHold.plusMinutes(tiempoMaximo).isAfter(LocalDateTime.now());
    }

    @Transactional
    public void liberarExpiradosTx() {
        LocalDateTime corte = LocalDateTime.now().minusMinutes(tiempoMaximo);
        List<Integer> aLiberar = new ArrayList<>();
        holds.forEach((idAuto, fechaHold) -> {
            if (fechaHold.isBefore(corte)) {
                aLiberar.add(idAuto);
            }
        });
        if (!aLiberar.isEmpty()) {
            log.info("Liberando {} holds expirados", aLiberar.size());
        }
        for (Integer idAuto : aLiberar) {
            holds.remove(idAuto);
            autoRepository.findById(idAuto).ifPresent(auto -> {
                if ("Reservado".equals(auto.getEstado())) {
                    auto.setEstado("Disponible");
                    log.info("Auto {} liberado: Reservado → Disponible", idAuto);
                }
            });
        }
    }

    @Transactional
    public void cancel(Integer idAuto) {
        holds.remove(idAuto);
        autoRepository.findById(idAuto).ifPresent(auto -> {
            if ("Reservado".equals(auto.getEstado())) {
                auto.setEstado("Disponible");
                log.info("Auto {} cancelado manualmente: Reservado → Disponible", idAuto);
            }
        });
    }
}
