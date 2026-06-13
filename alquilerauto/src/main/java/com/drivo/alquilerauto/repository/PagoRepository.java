package com.drivo.alquilerauto.repository;

import com.drivo.alquilerauto.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Integer> {

    List<Pago> findByReservaIdReserva(Integer idReserva);

    @Query("SELECT p FROM Pago p JOIN FETCH p.reserva r JOIN FETCH r.cliente ORDER BY p.fechaPago DESC")
    List<Pago> findAllWithReserva();
}
