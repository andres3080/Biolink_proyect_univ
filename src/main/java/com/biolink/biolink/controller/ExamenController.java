package com.biolink.biolink.controller;

import com.biolink.biolink.model.Examen;
import com.biolink.biolink.repository.ExamenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/examenes")
public class ExamenController {

    @Autowired
    private ExamenRepository examenRepository;

    @PostMapping
    public Examen crear(@RequestBody Examen examen) {
        return examenRepository.save(examen);
    }

    @GetMapping
    public List<Examen> listarTodos() {
        return examenRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Examen> buscarPorId(@PathVariable Long id) {
        return examenRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}