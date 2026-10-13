package com.biolink.biolink.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "eventos_hl7")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventoHl7 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "equipo_id")
    private Equipo equipo;

    @Column(nullable = false)
    private String tipoMensaje;

    @Column(nullable = false)
    private String direccion;

    @Column(nullable = false)
    private LocalDateTime fecha;

    private Long muestraId;

    private Long resultadoId;

    @Column(length = 1000)
    private String resumen;
}
