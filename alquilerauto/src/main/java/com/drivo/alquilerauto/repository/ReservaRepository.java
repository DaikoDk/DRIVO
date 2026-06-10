package com.drivo.alquilerauto.repository;

import com.drivo.alquilerauto.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Integer> {

    List<Reserva> findByClienteIdCliente(Integer idCliente);

    List<Reserva> findByAutoIdAuto(Integer idAuto);

    List<Reserva> findByEstado(String estado);

    List<Reserva> findByEstadoIn(List<String> estados);

    List<Reserva> findByFechaInicioBetween(LocalDate inicio, LocalDate fin);

    @Query("SELECT r FROM Reserva r JOIN FETCH r.cliente JOIN FETCH r.auto a JOIN FETCH a.marca JOIN FETCH a.modelo " +
           "ORDER BY r.fechaCreacion DESC")
    List<Reserva> findAllWithDetails();

    @Query("SELECT r FROM Reserva r JOIN FETCH r.cliente JOIN FETCH r.auto a JOIN FETCH a.marca JOIN FETCH a.modelo " +
           "WHERE r.estado = :estado ORDER BY r.fechaCreacion DESC")
    List<Reserva> findByEstadoWithDetails(@Param("estado") String estado);

    @Query("SELECT r FROM Reserva r JOIN FETCH r.cliente JOIN FETCH r.auto a JOIN FETCH a.marca JOIN FETCH a.modelo " +
           "WHERE r.idReserva = :id")
    java.util.Optional<Reserva> findByIdWithDetails(@Param("id") Integer id);

    @Query("SELECT r FROM Reserva r JOIN FETCH r.cliente JOIN FETCH r.auto a JOIN FETCH a.marca JOIN FETCH a.modelo " +
           "WHERE r.estado IN (:estados)")
    List<Reserva> findByEstadoInWithDetails(@Param("estados") List<String> estados);

    @Query(value = "SELECT COUNT(*) FROM tb_reserva WHERE CAST(fechaCreacion AS DATE) = CAST(GETDATE() AS DATE)", nativeQuery = true)
    long countReservasHoy();

    @Query(value = "SELECT ISNULL(SUM(total), 0) FROM tb_reserva WHERE estado = 'Finalizada' " +
           "AND MONTH(fechaFinalizacion) = MONTH(GETDATE()) AND YEAR(fechaFinalizacion) = YEAR(GETDATE())", nativeQuery = true)
    java.math.BigDecimal sumIngresosMesActual();

    @Query("SELECT r FROM Reserva r WHERE r.auto.idAuto = :idAuto " +
           "AND r.estado IN ('Pendiente', 'Confirmada', 'En proceso') " +
           "AND (:idReservaExcluir IS NULL OR r.idReserva != :idReservaExcluir) " +
           "AND r.fechaInicio <= :fechaFin AND r.fechaFin >= :fechaInicio")
    List<Reserva> findReservasSolapadas(
            @Param("idAuto") Integer idAuto,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin,
            @Param("idReservaExcluir") Integer idReservaExcluir);
}
