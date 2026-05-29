package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.request.PagoCreateRequest;
import com.drivo.alquilerauto.entity.Pago;
import com.drivo.alquilerauto.entity.Reserva;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.repository.PagoRepository;
import com.drivo.alquilerauto.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PagoService {

    private final PagoRepository pagoRepository;
    private final ReservaRepository reservaRepository;

    @Transactional(readOnly = true)
    public List<Pago> findAll() {
        return pagoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Pago findById(Integer id) {
        return pagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado con id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Pago> findByReserva(Integer idReserva) {
        return pagoRepository.findByReservaIdReserva(idReserva);
    }

    public Pago create(PagoCreateRequest request) {
        Reserva reserva = reservaRepository.findById(request.idReserva())
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada"));

        Pago pago = new Pago();
        pago.setReserva(reserva);
        pago.setMontoBase(request.montoBase());
        pago.setMontoMora(request.montoMora());
        pago.setMontoDanos(request.montoDanos());
        pago.setMontoTotalPagado(request.montoTotalPagado());
        pago.setMetodoPago(request.metodoPago());

        return pagoRepository.save(pago);
    }
}
