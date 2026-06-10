package com.drivo.alquilerauto.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_modelo")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"marca", "autos"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Modelo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer idModelo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idMarca", nullable = false)
    @JsonIgnore
    private Marca marca;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(length = 30)
    private String categoria;

    @Column(nullable = false)
    private Integer numeroPasajeros = 5;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(updatable = false)
    private LocalDateTime fechaRegistro;

    @OneToMany(mappedBy = "modelo")
    @JsonIgnore
    private List<Auto> autos = new ArrayList<>();
}
