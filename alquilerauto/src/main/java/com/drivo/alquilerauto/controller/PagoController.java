package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.request.PagoCreateRequest;
import com.drivo.alquilerauto.dto.response.PagoResponse;
import com.drivo.alquilerauto.mapper.PagoMapper;
import com.drivo.alquilerauto.service.PagoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoService pagoService;
    private final PagoMapper pagoMapper;

    @GetMapping
    public ResponseEntity<List<PagoResponse>> findAll(
            @RequestParam(required = false) Integer reserva) {
        if (reserva != null) {
            return ResponseEntity.ok(pagoMapper.toResponseList(pagoService.findByReserva(reserva)));
        }
        return ResponseEntity.ok(pagoMapper.toResponseList(pagoService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagoResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(pagoMapper.toResponse(pagoService.findById(id)));
    }

    @GetMapping("/reserva/{idReserva}")
    public ResponseEntity<List<PagoResponse>> findByReserva(@PathVariable Integer idReserva) {
        return ResponseEntity.ok(pagoMapper.toResponseList(pagoService.findByReserva(idReserva)));
    }

    @PostMapping
    public ResponseEntity<PagoResponse> create(@Valid @RequestBody PagoCreateRequest request) {
        return ResponseEntity.ok(pagoMapper.toResponse(pagoService.create(request)));
    }
}
