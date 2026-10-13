package com.biolink.biolink.hl7;

import ca.uhn.hl7v2.DefaultHapiContext;
import ca.uhn.hl7v2.HapiContext;
import ca.uhn.hl7v2.app.HL7Service;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Servidor MLLP que escucha conexiones de equipos biomédicos (o del simulador
 * HAPI TestPanel) en un puerto TCP y recibe mensajes HL7 v2.x.
 *
 * Los mensajes que llegan son procesados por Hl7OruHandler, que lee el
 * contenido y crea Resultados reales en la base de datos.
 */
@Service
public class Hl7ServerService {

    private static final Logger log = LoggerFactory.getLogger(Hl7ServerService.class);

    @Value("${hl7.server.port:6661}")
    private int puerto;

    @Autowired
    private Hl7OruHandler hl7OruHandler;

    private HapiContext contexto;
    private HL7Service servidor;

    @PostConstruct
    public void iniciar() {
        try {
            contexto = new DefaultHapiContext();

            servidor = contexto.newServer(puerto, false); // false = sin TLS, para pruebas locales
            servidor.registerApplication("*", "*", hl7OruHandler);

            servidor.startAndWait();
            log.info("Servidor HL7 (MLLP) escuchando en el puerto {}", puerto);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("El servidor HL7 fue interrumpido al iniciar", e);
        }
    }

    @PreDestroy
    public void detener() {
        if (servidor != null) {
            servidor.stopAndWait();
        }
        if (contexto != null) {
            try {
                contexto.close();
            } catch (Exception e) {
                log.warn("Error cerrando el contexto HAPI", e);
            }
        }
        log.info("Servidor HL7 (MLLP) detenido");
    }
}
