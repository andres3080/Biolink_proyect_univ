package com.biolink.biolink.repository;

import com.biolink.biolink.model.EventoHl7;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventoHl7Repository extends JpaRepository<EventoHl7, Long> {

    List<EventoHl7> findByEquipoIdOrderByFechaDesc(Long equipoId);

    List<EventoHl7> findTop50ByOrderByFechaDesc();
}
