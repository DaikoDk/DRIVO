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

    private final ConcurrentHashMap<Integer, HoldInfo> holds = new ConcurrentHashMap<>();
    private final AutoRepository autoRepository;

    @Value("${app.reserva.tiempo-maximo-minutos}")
    private int tiempoMaximo;

    record HoldInfo(LocalDateTime fechaHold, String estadoOriginal) {}

    @Transactional
    public HoldResponse hold(Integer idAuto) {
        Auto auto = autoRepository.findByIdWithLock(idAuto)
                .orElseThrow(() -> new ResourceNotFoundException("Auto no encontrado con id: " + idAuto));
        String estado = auto.getEstado();
        if (!"Disponible".equals(estado) && !"Reservado".equals(estado) && !"En proceso".equals(estado)) {
            throw new BadRequestException("Auto no disponible en este momento");
        }
        if ("Disponible".equals(estado)) {
            auto.setEstado("Reservado");
            autoRepository.save(auto);
        }
        holds.put(idAuto, new HoldInfo(LocalDateTime.now(), estado));
        log.info("Hold creado para auto {} (original={}, expira en {} min)", idAuto, estado, tiempoMaximo);
        return new HoldResponse(LocalDateTime.now().plusMinutes(tiempoMaximo));
    }

    public void release(Integer idAuto) {
        holds.remove(idAuto);
    }

    public boolean isValid(Integer idAuto) {
        HoldInfo info = holds.get(idAuto);
        return info != null && info.fechaHold().plusMinutes(tiempoMaximo).isAfter(LocalDateTime.now());
    }

    public String getEstadoOriginal(Integer idAuto) {
        HoldInfo info = holds.get(idAuto);
        return info != null ? info.estadoOriginal() : null;
    }

    @Transactional
    public void liberarExpiradosTx() {
        LocalDateTime corte = LocalDateTime.now().minusMinutes(tiempoMaximo);
        List<Integer> aLiberar = new ArrayList<>();
        holds.forEach((idAuto, info) -> {
            if (info.fechaHold().isBefore(corte)) {
                aLiberar.add(idAuto);
            }
        });
        if (!aLiberar.isEmpty()) {
            log.info("Liberando {} holds expirados", aLiberar.size());
        }
        for (Integer idAuto : aLiberar) {
            HoldInfo info = holds.remove(idAuto);
            if (info == null) continue;
            if ("Disponible".equals(info.estadoOriginal())) {
                autoRepository.findById(idAuto).ifPresent(auto -> {
                    if ("Reservado".equals(auto.getEstado())) {
                        auto.setEstado("Disponible");
                        log.info("Auto {} liberado: Reservado → Disponible", idAuto);
                    }
                });
            }
        }
    }

    @Transactional
    public void cancel(Integer idAuto) {
        HoldInfo info = holds.remove(idAuto);
        if (info != null && "Disponible".equals(info.estadoOriginal())) {
            autoRepository.findById(idAuto).ifPresent(auto -> {
                if ("Reservado".equals(auto.getEstado())) {
                    auto.setEstado("Disponible");
                    log.info("Auto {} cancelado: Reservado → Disponible", idAuto);
                }
            });
        }
    }
}
