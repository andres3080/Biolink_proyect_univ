package com.biolink.biolink.controller;

import com.biolink.biolink.model.Resultado;
import com.biolink.biolink.repository.ResultadoRepository;
import com.biolink.biolink.service.ResultadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/resultados")
public class ResultadoController {

    @Autowired
    private ResultadoService resultadoService;

    @Autowired
    private ResultadoRepository resultadoRepository;

    @PreAuthorize("hasRole('BIOANALISTA') or hasRole('ADMIN')")
    @PostMapping
    public Resultado crear(@RequestBody Resultado resultado) {
        return resultadoService.crearResultado(resultado);
    }
    @GetMapping
    public List<Resultado> listarTodos() {
        return resultadoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resultado> buscarPorId(@PathVariable Long id) {
        return resultadoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}