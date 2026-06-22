package com.drivo.alquilerauto.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReservaExpiracionScheduler {

    private final ReservaService reservaService;

    @Scheduled(fixedRate = 60_000)
    public void expirar() {
        reservaService.autoExpiracion();
    }
}
