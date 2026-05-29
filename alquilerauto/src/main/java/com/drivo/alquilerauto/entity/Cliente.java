package com.drivo.alquilerauto.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_cliente")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"licencia", "reservas", "usuario"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer idCliente;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(nullable = false, length = 50)
    private String apellidoPaterno;

    @Column(length = 50)
    private String apellidoMaterno;

    @Column(nullable = false, length = 15)
    private String dni;

    @Column(length = 20)
    private String telefono;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(length = 200)
    private String direccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idLicencia")
    private Licencia licencia;

    @Column(nullable = false)
    private Integer numeroReservas = 0;

    @Column(nullable = false)
    private Integer numeroIncidentes = 0;

    @Column(nullable = false)
    private Boolean bloqueado = false;

    @Column(nullable = false, length = 20)
    private String estado = "activo";

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(updatable = false)
    private LocalDateTime fechaRegistro;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idUsuario")
    private Usuario usuario;

    @OneToMany(mappedBy = "cliente")
    @JsonIgnore
    private List<Reserva> reservas = new ArrayList<>();
}
