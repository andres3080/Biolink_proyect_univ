package com.biolink.biolink.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "muestras")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Muestra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String codigoBarras;

    @ManyToOne
    @JoinColumn(name = "orden_id", nullable = false)
    private OrdenMedica ordenMedica;

    @ManyToOne
    @JoinColumn(name = "examen_id", nullable = false)
    private Examen examen;

    @Column(nullable = false)
    private String tipoMuestra;

    @Column(nullable = false)
    private LocalDateTime fechaToma;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoMuestra estado;
}
