package com.drivo.alquilerauto.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_auto")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"marca", "modelo", "reservas", "reparaciones", "mantenimientos", "historialKilometraje"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Auto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer idAuto;

    @Column(nullable = false, length = 10)
    private String placa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idMarca", nullable = false)
    private Marca marca;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idModelo", nullable = false)
    private Modelo modelo;

    @Column(nullable = false)
    private Integer anio;

    @Column(length = 30)
    private String color;

    @Column(length = 50)
    private String numeroMotor;

    @Column(length = 50)
    private String numeroChasis;

    @Column(nullable = false)
    private Integer kilometrajeActual = 0;

    private Integer ultimaRevisionKm;

    private Integer proximaRevisionKm;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precioPorDia;

    @Column(precision = 10, scale = 2)
    private BigDecimal precioPorHora;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal moraPorDia = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String estado = "Disponible";

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(updatable = false)
    private LocalDateTime fechaRegistro;

    private LocalDateTime fechaUltimaActualizacion;

    @OneToMany(mappedBy = "auto")
    @JsonIgnore
    private List<Reserva> reservas = new ArrayList<>();

    @OneToMany(mappedBy = "auto")
    @JsonIgnore
    private List<Reparacion> reparaciones = new ArrayList<>();

    @OneToMany(mappedBy = "auto")
    @JsonIgnore
    private List<Mantenimiento> mantenimientos = new ArrayList<>();

    @OneToMany(mappedBy = "auto")
    @JsonIgnore
    private List<HistorialKilometraje> historialKilometraje = new ArrayList<>();
}
