package com.drivo.alquilerauto.repository;

import com.drivo.alquilerauto.entity.Estado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstadoRepository extends JpaRepository<Estado, Integer> {
    Optional<Estado> findByCodigo(String codigo);
}
