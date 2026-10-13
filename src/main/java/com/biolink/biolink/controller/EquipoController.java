package com.biolink.biolink.controller;

import com.biolink.biolink.model.Equipo;
import com.biolink.biolink.model.EventoHl7;
import com.biolink.biolink.repository.EquipoRepository;
import com.biolink.biolink.repository.EventoHl7Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Expone el estado de los equipos biomédicos conectados por HL7 y su
 * historial de actividad (EventoHl7). El estado "conectado"/"desconectado"
 * no se guarda en la base de datos: se calcula acá comparando
 * ultimaConexion contra el momento actual.
 */
@RestController
@RequestMapping("/api/equipos")
public class EquipoController {

    // Un equipo se considera "conectado" si mandó o recibió algo en los
    // últimos 5 minutos.
    private static final long MINUTOS_CONECTADO = 5;

    @Autowired
    private EquipoRepository equipoRepository;

    @Autowired
    private EventoHl7Repository eventoHl7Repository;

    @PreAuthorize("hasRole('ADMIN') or hasRole('BIOANALISTA')")
    @GetMapping
    public List<Map<String, Object>> listar() {
        return equipoRepository.findAll().stream()
                .map(this::aRespuesta)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('BIOANALISTA')")
    @GetMapping("/{id}/eventos")
    public ResponseEntity<List<EventoHl7>> eventosDeEquipo(@PathVariable Long id) {
        if (!equipoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(eventoHl7Repository.findByEquipoIdOrderByFechaDesc(id));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('BIOANALISTA')")
    @GetMapping("/eventos/recientes")
    public List<EventoHl7> eventosRecientes() {
        return eventoHl7Repository.findTop50ByOrderByFechaDesc();
    }

    private Map<String, Object> aRespuesta(Equipo equipo) {
        boolean conectado = equipo.getUltimaConexion() != null
                && equipo.getUltimaConexion().isAfter(LocalDateTime.now().minusMinutes(MINUTOS_CONECTADO));

        Map<String, Object> respuesta = new LinkedHashMap<>();
        respuesta.put("id", equipo.getId());
        respuesta.put("nombre", equipo.getNombre());
        respuesta.put("identificadorHl7", equipo.getIdentificadorHl7());
        respuesta.put("ip", equipo.getIp());
        respuesta.put("ultimaConexion", equipo.getUltimaConexion());
        respuesta.put("conectado", conectado);
        return respuesta;
    }
}
