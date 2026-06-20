package com.drivo.alquilerauto.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_reserva")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"cliente", "auto", "pagos", "reparaciones", "historialKilometraje"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer idReserva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idCliente", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idAuto", nullable = false)
    private Auto auto;

    @Column(nullable = false)
    private LocalDate fechaInicio;

    @Column(nullable = false)
    private LocalTime horaInicio;

    @Column(nullable = false)
    private LocalDate fechaFin;

    @Column(nullable = false)
    private LocalTime horaFin;

    private Integer kilometrajeInicio;

    private Integer kilometrajeFin;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal mora = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal costoReparaciones = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_estado", nullable = false)
    private Estado estado;

    @Column(nullable = false, length = 30)
    private String estadoEntrega = "Sin entregar";

    @Column(length = 500)
    private String observacionesEntrega;

    private LocalDateTime fechaHoraInicioReal;

    private LocalDateTime fechaHoraFinReal;

    private LocalDateTime fechaHoraCheckIn;

    @Column(updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(length = 100)
    private String usuarioCreacion;

    private LocalDateTime fechaFinalizacion;

    @Column(length = 100)
    private String usuarioFinalizacion;

    @OneToMany(mappedBy = "reserva")
    @JsonIgnore
    private List<Pago> pagos = new ArrayList<>();

    @OneToMany(mappedBy = "reserva")
    @JsonIgnore
    private List<Reparacion> reparaciones = new ArrayList<>();

    @OneToMany(mappedBy = "reserva")
    @JsonIgnore
    private List<HistorialKilometraje> historialKilometraje = new ArrayList<>();
}
