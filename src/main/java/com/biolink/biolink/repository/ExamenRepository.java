package com.biolink.biolink.repository;

import com.biolink.biolink.model.Examen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExamenRepository extends JpaRepository<Examen, Long> {

    Optional<Examen> findByCodigo(String codigo);
}