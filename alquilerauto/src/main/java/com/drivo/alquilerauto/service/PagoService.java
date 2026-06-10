package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.request.PagoCreateRequest;
import com.drivo.alquilerauto.dto.response.PagoResponse;
import com.drivo.alquilerauto.entity.Pago;
import com.drivo.alquilerauto.entity.Reserva;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.mapper.PagoMapper;
import com.drivo.alquilerauto.repository.PagoRepository;
import com.drivo.alquilerauto.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PagoService {

    private final PagoRepository pagoRepository;
    private final ReservaRepository reservaRepository;
    private final PagoMapper pagoMapper;

    @Transactional(readOnly = true)
    public List<PagoResponse> findAll() {
        return pagoMapper.toResponseList(pagoRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<PagoResponse> findByReserva(Integer idReserva) {
        if (!reservaRepository.existsById(idReserva)) {
            throw new ResourceNotFoundException("Reserva no encontrada con id: " + idReserva);
        }
        return pagoMapper.toResponseList(pagoRepository.findByReservaIdReserva(idReserva));
    }

    @Transactional(readOnly = true)
    public PagoResponse findById(Integer id) {
        Pago pago = pagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado con id: " + id));
        return pagoMapper.toResponse(pago);
    }

    public PagoResponse create(PagoCreateRequest request) {
        Reserva reserva = reservaRepository.findById(request.idReserva())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reserva no encontrada con id: " + request.idReserva()));

        BigDecimal total = request.montoBase()
                .add(request.montoMora())
                .add(request.montoDanos());

        Pago pago = new Pago();
        pago.setReserva(reserva);
        pago.setMontoBase(request.montoBase());
        pago.setMontoMora(request.montoMora());
        pago.setMontoDanos(request.montoDanos());
        pago.setMontoTotalPagado(total);
        pago.setMetodoPago(request.metodoPago());
        pago.setFechaPago(LocalDateTime.now());

        return pagoMapper.toResponse(pagoRepository.save(pago));
    }
}
