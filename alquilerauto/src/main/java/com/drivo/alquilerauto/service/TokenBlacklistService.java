package com.drivo.alquilerauto.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class TokenBlacklistService {

    private final Map<String, Instant> blacklist = new ConcurrentHashMap<>();

    public void blacklist(String token, Instant expiresAt) {
        blacklist.put(token, expiresAt);
    }

    public boolean isBlacklisted(String token) {
        return blacklist.containsKey(token);
    }

    @Scheduled(fixedRate = 3600000)
    @PostConstruct
    public void cleanup() {
        Instant now = Instant.now();
        blacklist.entrySet().removeIf(e -> e.getValue().isBefore(now));
        if (!blacklist.isEmpty()) {
            log.debug("Token blacklist cleanup: {} active entries", blacklist.size());
        }
    }
}
