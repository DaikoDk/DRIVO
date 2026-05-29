package com.drivo.alquilerauto.repository;

import com.drivo.alquilerauto.entity.HistorialKilometraje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialKilometrajeRepository extends JpaRepository<HistorialKilometraje, Integer> {

    List<HistorialKilometraje> findByAutoIdAutoOrderByFechaRegistroDesc(Integer idAuto);

    List<HistorialKilometraje> findByReservaIdReserva(Integer idReserva);
}
