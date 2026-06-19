package com.drivo.alquilerauto.repository;

import com.drivo.alquilerauto.entity.Reparacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReparacionRepository extends JpaRepository<Reparacion, Integer> {

    @Query("SELECT DISTINCT r FROM Reparacion r " +
           "JOIN FETCH r.reserva " +
           "JOIN FETCH r.auto " +
           "LEFT JOIN FETCH r.catalogoReparacion " +
           "ORDER BY r.fechaReporte DESC")
    List<Reparacion> findAll();

    @Query("SELECT DISTINCT r FROM Reparacion r " +
           "JOIN FETCH r.reserva " +
           "JOIN FETCH r.auto " +
           "LEFT JOIN FETCH r.catalogoReparacion " +
           "WHERE r.estado = :estado " +
           "ORDER BY r.fechaReporte DESC")
    List<Reparacion> findByEstado(String estado);

    List<Reparacion> findByReservaIdReserva(Integer idReserva);

    List<Reparacion> findByAutoIdAuto(Integer idAuto);
}
