package com.drivo.alquilerauto.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_configuracion")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Configuracion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer idConfiguracion;

    @Column(nullable = false, length = 50)
    private String clave;

    @Column(nullable = false, length = 200)
    private String valor;

    @Column(length = 300)
    private String descripcion;

    @Column(length = 20)
    private String tipo;

    @Column(updatable = false)
    private LocalDateTime fechaActualizacion;
}
