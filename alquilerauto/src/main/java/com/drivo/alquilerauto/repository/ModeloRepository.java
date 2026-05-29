package com.drivo.alquilerauto.repository;

import com.drivo.alquilerauto.entity.Modelo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModeloRepository extends JpaRepository<Modelo, Integer> {

    List<Modelo> findByActivoTrue();

    List<Modelo> findByMarcaIdMarcaAndActivoTrue(Integer idMarca);

    List<Modelo> findByCategoria(String categoria);
}
