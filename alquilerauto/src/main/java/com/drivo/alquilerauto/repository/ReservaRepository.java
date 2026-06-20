package com.drivo.alquilerauto.repository;

import com.drivo.alquilerauto.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Integer> {

    List<Reserva> findByClienteIdCliente(Integer idCliente);

    @Query("SELECT r FROM Reserva r JOIN FETCH r.cliente JOIN FETCH r.estado JOIN FETCH r.auto a JOIN FETCH a.marca JOIN FETCH a.modelo " +
           "WHERE r.cliente.idCliente = :idCliente ORDER BY r.fechaCreacion DESC")
    List<Reserva> findByClienteIdClienteWithDetails(@Param("idCliente") Integer idCliente);

    List<Reserva> findByAutoIdAuto(Integer idAuto);

    @Query("SELECT r FROM Reserva r WHERE r.estado.codigo = :codigo")
    List<Reserva> findByEstado(@Param("codigo") String codigo);

    @Query("SELECT r FROM Reserva r WHERE r.estado.codigo IN (:codigos)")
    List<Reserva> findByEstadoIn(@Param("codigos") List<String> codigos);

    List<Reserva> findByFechaInicioBetween(LocalDate inicio, LocalDate fin);

    @Query("SELECT r FROM Reserva r JOIN FETCH r.cliente JOIN FETCH r.estado JOIN FETCH r.auto a JOIN FETCH a.marca JOIN FETCH a.modelo " +
           "ORDER BY r.fechaCreacion DESC")
    List<Reserva> findAllWithDetails();

    @Query("SELECT r FROM Reserva r JOIN FETCH r.cliente JOIN FETCH r.estado JOIN FETCH r.auto a JOIN FETCH a.marca JOIN FETCH a.modelo " +
           "WHERE r.estado.codigo = :codigo ORDER BY r.fechaCreacion DESC")
    List<Reserva> findByEstadoWithDetails(@Param("codigo") String codigo);

    @Query("SELECT r FROM Reserva r JOIN FETCH r.cliente JOIN FETCH r.estado JOIN FETCH r.auto a JOIN FETCH a.marca JOIN FETCH a.modelo " +
           "WHERE r.idReserva = :id")
    java.util.Optional<Reserva> findByIdWithDetails(@Param("id") Integer id);

    @Query("SELECT r FROM Reserva r JOIN FETCH r.cliente JOIN FETCH r.estado JOIN FETCH r.auto a JOIN FETCH a.marca JOIN FETCH a.modelo " +
           "WHERE r.estado.codigo IN (:codigos)")
    List<Reserva> findByEstadoInWithDetails(@Param("codigos") List<String> codigos);

    @Query(value = "SELECT COUNT(*) FROM tb_reserva WHERE CAST(fechaCreacion AS DATE) = CAST(GETDATE() AS DATE)", nativeQuery = true)
    long countReservasHoy();

    @Query(value = "SELECT ISNULL(SUM(total), 0) FROM tb_reserva WHERE id_estado = " +
           "(SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_FINALIZADO') " +
           "AND MONTH(fechaFinalizacion) = MONTH(GETDATE()) AND YEAR(fechaFinalizacion) = YEAR(GETDATE())", nativeQuery = true)
    java.math.BigDecimal sumIngresosMesActual();

    @Query("SELECT r FROM Reserva r WHERE r.auto.idAuto = :idAuto " +
            "AND r.estado.codigo IN ('RESERVA_PENDIENTE', 'RESERVA_CONFIRMADA', 'ALQUILER_EN_CURSO') " +
            "AND (:idReservaExcluir IS NULL OR r.idReserva != :idReservaExcluir) " +
            "AND r.fechaInicio <= :fechaFin AND r.fechaFin >= :fechaInicio")
    List<Reserva> findReservasSolapadas(
            @Param("idAuto") Integer idAuto,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin,
            @Param("idReservaExcluir") Integer idReservaExcluir);

    @Query("SELECT r FROM Reserva r JOIN FETCH r.cliente JOIN FETCH r.estado JOIN FETCH r.auto a JOIN FETCH a.marca JOIN FETCH a.modelo " +
           "WHERE CAST(r.fechaCreacion AS date) = CURRENT_DATE ORDER BY r.fechaCreacion DESC")
    List<Reserva> findReservasHoy();

    @Query("SELECT r FROM Reserva r JOIN FETCH r.auto JOIN FETCH r.cliente JOIN FETCH r.estado " +
            "WHERE r.estado.codigo = 'RESERVA_CONFIRMADA' " +
            "AND r.fechaInicio <= :hoy")
    List<Reserva> findConfirmadasParaIniciar(
            @Param("hoy") LocalDate hoy);

    @Query("SELECT r FROM Reserva r WHERE r.auto.idAuto = :idAuto " +
            "AND r.estado.codigo IN ('RESERVA_CONFIRMADA', 'ALQUILER_EN_CURSO') " +
            "AND r.fechaFin <= :fechaInicio " +
            "ORDER BY r.fechaFin DESC, r.horaFin DESC")
    List<Reserva> findUltimaReservaAntesDe(
            @Param("idAuto") Integer idAuto,
            @Param("fechaInicio") LocalDate fechaInicio);

    @Query(value = "SELECT FORMAT(fechaFinalizacion, 'yyyy-MM') AS mes, " +
            "ISNULL(SUM(total), 0) AS monto " +
            "FROM tb_reserva " +
            "WHERE id_estado = (SELECT id_estado FROM tb_estado WHERE entidad = 'RESERVA' AND codigo = 'ALQUILER_FINALIZADO') " +
            "AND fechaFinalizacion >= DATEADD(MONTH, -5, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)) " +
            "GROUP BY FORMAT(fechaFinalizacion, 'yyyy-MM') " +
            "ORDER BY mes", nativeQuery = true)
    List<Object[]> findIngresosMensuales();
}
