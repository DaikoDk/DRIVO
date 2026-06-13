package com.drivo.alquilerauto.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_pago")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer idPago;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idReserva", nullable = false)
    private Reserva reserva;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montoBase;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montoMora = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montoDanos = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTotalPagado;

    @Column(updatable = false)
    private LocalDateTime fechaPago;

    @Column(nullable = false, length = 30)
    private String metodoPago;

    @PrePersist
    void prePersist() {
        this.fechaPago = LocalDateTime.now();
        BigDecimal mora = this.montoMora != null ? this.montoMora : BigDecimal.ZERO;
        BigDecimal danos = this.montoDanos != null ? this.montoDanos : BigDecimal.ZERO;
        this.montoTotalPagado = this.montoBase.add(mora).add(danos);
    }
}
