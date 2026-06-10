package com.drivo.alquilerauto.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_reparacion")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Reparacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer idReparacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idReserva", nullable = false)
    private Reserva reserva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idAuto", nullable = false)
    private Auto auto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idCatalogoReparacion")
    private CatalogoReparacion catalogoReparacion;

    @Column(nullable = false, length = 500)
    private String descripcion;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal costo;

    @Column(nullable = false, length = 20)
    private String estado = "Pendiente";

    @Column(length = 30)
    private String responsable;

    @Column(updatable = false)
    private LocalDateTime fechaReporte;

    private LocalDateTime fechaInicio;

    private LocalDateTime fechaFin;

    @Column(length = 100)
    private String usuarioReporte;
}
