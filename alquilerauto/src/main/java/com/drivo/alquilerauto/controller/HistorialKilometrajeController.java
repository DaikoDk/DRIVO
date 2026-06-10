package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.entity.HistorialKilometraje;
import com.drivo.alquilerauto.service.HistorialKilometrajeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historial-km")
@RequiredArgsConstructor
public class HistorialKilometrajeController {

    private final HistorialKilometrajeService service;

    @GetMapping
    public ResponseEntity<List<HistorialKilometraje>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/auto/{idAuto}")
    public ResponseEntity<List<HistorialKilometraje>> findByAuto(@PathVariable Integer idAuto) {
        return ResponseEntity.ok(service.findByAuto(idAuto));
    }
}
