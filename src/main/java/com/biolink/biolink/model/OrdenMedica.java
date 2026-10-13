package com.biolink.biolink.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "ordenes_medicas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrdenMedica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToMany
    @JoinTable(
            name = "orden_examen",
            joinColumns = @JoinColumn(name = "orden_id"),
            inverseJoinColumns = @JoinColumn(name = "examen_id")
    )
    private List<Examen> examenes;

    @Column(nullable = false)
    private String medicoSolicitante;

    @Column(nullable = false)
    private LocalDate fechaOrden;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoOrden estado;
}