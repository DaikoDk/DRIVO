package com.drivo.alquilerauto.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_marca")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"modelos", "autos"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Marca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer idMarca;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(length = 50)
    private String paisOrigen;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(updatable = false)
    private LocalDateTime fechaRegistro;

    @OneToMany(mappedBy = "marca")
    @JsonIgnore
    private List<Modelo> modelos = new ArrayList<>();

    @OneToMany(mappedBy = "marca")
    @JsonIgnore
    private List<Auto> autos = new ArrayList<>();
}
