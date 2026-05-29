package com.drivo.alquilerauto.repository;

import com.drivo.alquilerauto.entity.CatalogoReparacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CatalogoReparacionRepository extends JpaRepository<CatalogoReparacion, Integer> {

    List<CatalogoReparacion> findByActivoTrue();
}
