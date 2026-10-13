package com.biolink.biolink.controller;

import com.biolink.biolink.hl7.Hl7ClientService;
import com.biolink.biolink.model.EstadoMuestra;
import com.biolink.biolink.model.Muestra;
import com.biolink.biolink.repository.MuestraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/muestras")
public class MuestraController {

    @Autowired
    private MuestraRepository muestraRepository;

    @Autowired
    private Hl7ClientService hl7ClientService;

    @PreAuthorize("hasRole('ADMIN') or hasRole('BIOANALISTA') or hasRole('RECEPCIONISTA')")
    @PostMapping
    public Muestra crear(@RequestBody Muestra muestra) {
        muestra.setEstado(EstadoMuestra.TOMADA);
        Muestra guardada = muestraRepository.save(muestra);
        hl7ClientService.enviarOrdenParaMuestra(guardada.getId());
        return guardada;
    }

    @GetMapping
    public List<Muestra> listarTodas() {
        return muestraRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Muestra> buscarPorId(@PathVariable Long id) {
        return muestraRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/codigo/{codigoBarras}")
    public ResponseEntity<Muestra> buscarPorCodigoBarras(@PathVariable String codigoBarras) {
        return muestraRepository.findByCodigoBarras(codigoBarras)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
