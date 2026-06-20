package com.drivo.alquilerauto.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class HoldCleanupScheduler {

    private final HoldService holdService;

    @Scheduled(fixedRate = 30_000)
    public void limpiar() {
        holdService.liberarExpiradosTx();
    }
}
