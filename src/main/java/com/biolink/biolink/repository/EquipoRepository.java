package com.biolink.biolink.repository;

import com.biolink.biolink.model.Equipo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EquipoRepository extends JpaRepository<Equipo, Long> {

    Optional<Equipo> findByIdentificadorHl7(String identificadorHl7);
}
