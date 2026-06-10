package com.drivo.alquilerauto.repository;

import com.drivo.alquilerauto.entity.Configuracion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracionRepository extends JpaRepository<Configuracion, Integer> {

    Optional<Configuracion> findByClave(String clave);
}
