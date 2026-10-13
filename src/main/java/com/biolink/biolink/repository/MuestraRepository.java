package com.biolink.biolink.repository;

import com.biolink.biolink.model.Muestra;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MuestraRepository extends JpaRepository<Muestra, Long> {

    Optional<Muestra> findByCodigoBarras(String codigoBarras);
}