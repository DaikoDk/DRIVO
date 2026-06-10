package com.drivo.alquilerauto.repository;

import com.drivo.alquilerauto.entity.Reparacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReparacionRepository extends JpaRepository<Reparacion, Integer> {

    List<Reparacion> findByReservaIdReserva(Integer idReserva);

    List<Reparacion> findByAutoIdAuto(Integer idAuto);

    List<Reparacion> findByEstado(String estado);
}
