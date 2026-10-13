package com.biolink.biolink.controller;

import com.biolink.biolink.model.EstadoOrden;
import com.biolink.biolink.model.OrdenMedica;
import com.biolink.biolink.repository.OrdenMedicaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ordenes")
public class OrdenMedicaController {

    @Autowired
    private OrdenMedicaRepository ordenMedicaRepository;

    @PreAuthorize("hasRole('RECEPCIONISTA') or hasRole('ADMIN')")
    @PostMapping
    public OrdenMedica crear(@RequestBody OrdenMedica orden) {
        orden.setEstado(EstadoOrden.PENDIENTE);
        return ordenMedicaRepository.save(orden);
    }

    @GetMapping
    public List<OrdenMedica> listarTodas() {
        return ordenMedicaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdenMedica> buscarPorId(@PathVariable Long id) {
        return ordenMedicaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
