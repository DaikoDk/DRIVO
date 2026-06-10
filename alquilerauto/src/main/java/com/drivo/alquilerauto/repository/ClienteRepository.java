package com.drivo.alquilerauto.repository;

import com.drivo.alquilerauto.entity.Cliente;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    @EntityGraph(attributePaths = {"licencia"})
    List<Cliente> findByActivoTrue();

    @EntityGraph(attributePaths = {"licencia"})
    Optional<Cliente> findById(Integer id);

    List<Cliente> findByActivoTrueAndEstado(String estado);

    Optional<Cliente> findByDni(String dni);

    Optional<Cliente> findByEmail(String email);

    boolean existsByDni(String dni);

    boolean existsByEmail(String email);

    List<Cliente> findByBloqueadoTrue();
}
