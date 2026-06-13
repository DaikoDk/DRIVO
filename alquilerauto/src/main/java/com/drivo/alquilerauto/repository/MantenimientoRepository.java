package com.drivo.alquilerauto.repository;

import com.drivo.alquilerauto.entity.Mantenimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MantenimientoRepository extends JpaRepository<Mantenimiento, Integer> {

    List<Mantenimiento> findByAutoIdAuto(Integer idAuto);

    List<Mantenimiento> findByFechaIngresoBetween(LocalDate inicio, LocalDate fin);

    List<Mantenimiento> findByFechaSalidaIsNull();

    @Query("SELECT m FROM Mantenimiento m JOIN FETCH m.auto a JOIN FETCH a.modelo WHERE m.fechaSalida IS NULL")
    List<Mantenimiento> findEnCursoConAuto();
}
