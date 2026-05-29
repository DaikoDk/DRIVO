package com.drivo.alquilerauto.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_historial_kilometraje")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class HistorialKilometraje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer idHistorial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idAuto", nullable = false)
    private Auto auto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idReserva")
    private Reserva reserva;

    @Column(nullable = false)
    private Integer kilometrajeAnterior;

    @Column(nullable = false)
    private Integer kilometrajeNuevo;

    @Column(insertable = false, updatable = false)
    private Integer diferencia;

    @Column(nullable = false, length = 30)
    private String tipoRegistro = "Reserva";

    @Column(length = 300)
    private String observaciones;

    @Column(updatable = false)
    private LocalDateTime fechaRegistro;

    @Column(length = 100)
    private String usuarioRegistro;
}
