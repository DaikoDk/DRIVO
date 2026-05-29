package com.drivo.alquilerauto.repository;

import com.drivo.alquilerauto.entity.Licencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LicenciaRepository extends JpaRepository<Licencia, Integer> {
}
