package com.biolink.biolink.service;

import com.biolink.biolink.model.Examen;
import com.biolink.biolink.model.EstadoResultado;
import com.biolink.biolink.model.Muestra;
import com.biolink.biolink.model.Resultado;
import com.biolink.biolink.repository.MuestraRepository;
import com.biolink.biolink.repository.ResultadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ResultadoService {

    @Autowired
    private ResultadoRepository resultadoRepository;

    @Autowired
    private MuestraRepository muestraRepository;

    public Resultado crearResultado(Resultado resultadoEntrante) {

        Long muestraId = resultadoEntrante.getMuestra().getId();
        Muestra muestra = muestraRepository.findById(muestraId)
                .orElseThrow(() -> new RuntimeException("Muestra no encontrada con id: " + muestraId));

        Examen examen = muestra.getExamen();
        BigDecimal valor = resultadoEntrante.getValorObtenido();

        boolean dentroDeRango =
                valor.compareTo(examen.getRangoReferenciaMin()) >= 0 &&
                        valor.compareTo(examen.getRangoReferenciaMax()) <= 0;

        if (dentroDeRango) {
            resultadoEntrante.setEstado(EstadoResultado.VALIDADO);
        } else {
            resultadoEntrante.setEstado(EstadoResultado.PENDIENTE_REVISION);
        }

        resultadoEntrante.setMuestra(muestra);

        return resultadoRepository.save(resultadoEntrante);
    }
}