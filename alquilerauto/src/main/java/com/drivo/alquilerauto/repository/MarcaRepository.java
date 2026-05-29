package com.drivo.alquilerauto.repository;

import com.drivo.alquilerauto.entity.Marca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarcaRepository extends JpaRepository<Marca, Integer> {

    List<Marca> findByActivoTrue();

    Optional<Marca> findByNombre(String nombre);

    boolean existsByNombre(String nombre);
}
