package com.biolink.biolink.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "resultados")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Resultado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "muestra_id", nullable = false)
    private Muestra muestra;

    @Column(nullable = false)
    private BigDecimal valorObtenido;

    @Column(nullable = false)
    private LocalDateTime fechaResultado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoResultado estado;

    private String observaciones;
}