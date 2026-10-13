package com.biolink.biolink.controller;

import com.biolink.biolink.repository.MuestraRepository;
import com.biolink.biolink.repository.OrdenMedicaRepository;
import com.biolink.biolink.repository.PacienteRepository;
import com.biolink.biolink.repository.ResultadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

// Endpoint público (sin login) con solo conteos, para mostrar cifras reales
// en la pantalla de login. No expone datos de pacientes ni resultados, solo totales.
@RestController
@RequestMapping("/api/publico")
public class EstadisticasPublicasController {

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private ResultadoRepository resultadoRepository;

    @Autowired
    private MuestraRepository muestraRepository;

    @Autowired
    private OrdenMedicaRepository ordenMedicaRepository;

    @GetMapping("/estadisticas")
    public Map<String, Long> estadisticas() {
        return Map.of(
                "pacientes", pacienteRepository.count(),
                "resultados", resultadoRepository.count(),
                "muestras", muestraRepository.count(),
                "ordenes", ordenMedicaRepository.count()
        );
    }
}
