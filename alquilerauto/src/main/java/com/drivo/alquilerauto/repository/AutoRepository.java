package com.drivo.alquilerauto.repository;

import com.drivo.alquilerauto.entity.Auto;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AutoRepository extends JpaRepository<Auto, Integer> {

    @EntityGraph(attributePaths = {"marca", "modelo"})
    List<Auto> findByActivoTrue();

    @EntityGraph(attributePaths = {"marca", "modelo"})
    List<Auto> findByActivoTrueAndEstado(String estado);

    Optional<Auto> findByPlaca(String placa);

    boolean existsByPlaca(String placa);

    List<Auto> findByMarcaIdMarca(Integer idMarca);

    List<Auto> findByModeloIdModelo(Integer idModelo);

    @EntityGraph(attributePaths = {"marca", "modelo"})
    @Query("SELECT a FROM Auto a WHERE a.activo = true AND a.estado = 'Disponible' " +
           "AND a.idAuto NOT IN (SELECT r.auto.idAuto FROM Reserva r WHERE r.estado IN ('Pendiente', 'Confirmada', 'En proceso') " +
           "AND r.fechaInicio <= :fechaFin AND r.fechaFin >= :fechaInicio)")
    List<Auto> findDisponiblesEnRango(
            @Param("fechaInicio") java.time.LocalDate fechaInicio,
            @Param("fechaFin") java.time.LocalDate fechaFin);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Auto a WHERE a.idAuto = :id")
    Optional<Auto> findByIdWithLock(@Param("id") Integer id);
}
