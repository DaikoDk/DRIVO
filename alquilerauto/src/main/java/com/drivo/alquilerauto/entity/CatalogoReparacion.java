package com.drivo.alquilerauto.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_catalogo_reparacion")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CatalogoReparacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer idCatalogoReparacion;

    @Column(nullable = false, length = 200)
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal costoEstimado = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer tiempoEstimadoHoras = 0;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(updatable = false)
    private LocalDateTime fechaRegistro;
}
