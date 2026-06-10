package com.drivo.alquilerauto.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "tb_licencia")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Licencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer idLicencia;

    @Column(nullable = false, length = 30)
    private String numeroLicencia;

    @Column(nullable = false, length = 10)
    private String categoria;

    @Column(nullable = false)
    private LocalDate fechaVencimiento;
}
