package com.drivo.alquilerauto.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_usuario")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdUsuario")
    @EqualsAndHashCode.Include
    private Integer idUsuario;

    @Column(name = "Nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "Correo", nullable = false, length = 100)
    private String correo;

    @Column(name = "Clave", nullable = false, length = 255)
    private String clave;

    @Column(name = "Rol", nullable = false, length = 30)
    private String rol;

    @Column(name = "Activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "FechaRegistro", updatable = false)
    private LocalDateTime fechaRegistro;
}
