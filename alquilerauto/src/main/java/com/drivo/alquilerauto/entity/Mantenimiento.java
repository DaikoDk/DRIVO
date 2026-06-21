package com.drivo.alquilerauto.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tb_mantenimiento")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Mantenimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer idMantenimiento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idAuto", nullable = false)
    private Auto auto;

    @Column(nullable = false)
    private LocalDate fechaIngreso;

    private LocalDate fechaSalida;

    @Column(nullable = false, length = 20)
    private String tipo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal costo = BigDecimal.ZERO;

    @Lob
    private String detalle;
}
