package com.biolink.biolink.controller;

import com.biolink.biolink.model.Paciente;
import com.biolink.biolink.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {

    @Autowired
    private PacienteRepository pacienteRepository;

    @PreAuthorize("hasRole('RECEPCIONISTA') or hasRole('ADMIN')")
    @PostMapping
    public Paciente crear(@RequestBody Paciente paciente) {
        return pacienteRepository.save(paciente);
    }

    @GetMapping
    public List<Paciente> listarTodos() {
        return pacienteRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Paciente> buscarPorId(@PathVariable Long id) {
        return pacienteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
