package com.biolink.biolink.hl7;

import ca.uhn.hl7v2.DefaultHapiContext;
import ca.uhn.hl7v2.HapiContext;
import ca.uhn.hl7v2.app.Connection;
import ca.uhn.hl7v2.app.Initiator;
import ca.uhn.hl7v2.model.Message;
import ca.uhn.hl7v2.parser.PipeParser;
import com.biolink.biolink.model.Equipo;
import com.biolink.biolink.model.EventoHl7;
import com.biolink.biolink.model.Examen;
import com.biolink.biolink.model.Muestra;
import com.biolink.biolink.model.Paciente;
import com.biolink.biolink.repository.EquipoRepository;
import com.biolink.biolink.repository.EventoHl7Repository;
import com.biolink.biolink.repository.MuestraRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Cliente HL7: se conecta al equipo biomédico (o al simulador) y le manda
 * un mensaje ORM^O01 avisando que hay una orden de trabajo pendiente para
 * una muestra específica.
 *
 * El "equipo" al que le mandamos siempre es el mismo (host/puerto fijos en
 * application.properties), identificado con el mismo nombre que se usa como
 * receiving application (MSH-5) del ORM. Cada envío queda registrado como
 * EventoHl7 saliente y actualiza la ultimaConexion de ese Equipo.
 */
@Service
public class Hl7ClientService {

    private static final Logger log = LoggerFactory.getLogger(Hl7ClientService.class);

    private static final String IDENTIFICADOR_EQUIPO = "LABEQUIPO";

    @Value("${hl7.equipo.host:localhost}")
    private String equipoHost;

    @Value("${hl7.equipo.port:6662}")
    private int equipoPort;

    @Autowired
    private MuestraRepository muestraRepository;

    @Autowired
    private EquipoRepository equipoRepository;

    @Autowired
    private EventoHl7Repository eventoHl7Repository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void enviarOrdenParaMuestra(Long muestraId) {
        try {
            Muestra muestra = muestraRepository.findById(muestraId)
                    .orElseThrow(() -> new IllegalStateException(
                            "No se encontró la muestra con id " + muestraId));

            String mensajeTexto = construirMensajeOrm(muestra);
            log.info("Enviando ORM a {}:{} ->\n{}", equipoHost, equipoPort, mensajeTexto);

            try (HapiContext contexto = new DefaultHapiContext()) {
                PipeParser parser = contexto.getPipeParser();
                Message mensaje = parser.parse(mensajeTexto);

                Connection conexion = contexto.newClient(equipoHost, equipoPort, false);
                Initiator initiator = conexion.getInitiator();
                initiator.setTimeoutMillis(8000); // 8 segundos máximo esperando respuesta del equipo

                Message respuesta = initiator.sendAndReceive(mensaje);
                log.info("Respuesta del equipo:\n{}", parser.encode(respuesta));

                conexion.close();
            }

            registrarEnvioExitoso(muestra);
        } catch (Exception e) {
            log.error("No se pudo enviar el ORM para la muestra con id {}", muestraId, e);
        }
    }

    /**
     * Actualiza la ultimaConexion del Equipo y guarda el EventoHl7 saliente.
     * No debe tumbar el envío si algo acá falla; por eso se llama después de
     * que la conexión al equipo ya se cerró bien.
     */
    private void registrarEnvioExitoso(Muestra muestra) {
        try {
            Equipo equipo = equipoRepository.findByIdentificadorHl7(IDENTIFICADOR_EQUIPO)
                    .orElseGet(() -> {
                        Equipo nuevo = new Equipo();
                        nuevo.setIdentificadorHl7(IDENTIFICADOR_EQUIPO);
                        nuevo.setNombre(IDENTIFICADOR_EQUIPO);
                        return nuevo;
                    });
            equipo.setUltimaConexion(LocalDateTime.now());
            equipo = equipoRepository.save(equipo);

            EventoHl7 evento = new EventoHl7();
            evento.setEquipo(equipo);
            evento.setTipoMensaje("ORM^O01");
            evento.setDireccion("SALIENTE");
            evento.setFecha(LocalDateTime.now());
            evento.setMuestraId(muestra.getId());
            evento.setResumen("Orden enviada para muestra " + muestra.getCodigoBarras());
            eventoHl7Repository.save(evento);
        } catch (Exception e) {
            log.warn("No se pudo registrar el evento HL7 saliente: {}", e.getMessage());
        }
    }

    private String construirMensajeOrm(Muestra muestra) {
        Paciente paciente = muestra.getOrdenMedica().getPaciente();
        Examen examen = muestra.getExamen();

        String timestamp = java.time.LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        String fechaNacimiento = paciente.getFechaNacimiento() != null
                ? paciente.getFechaNacimiento().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                : "";

        StringBuilder mensaje = new StringBuilder();
        mensaje.append("MSH|^~\\&|BIOLINK|LAB|").append(IDENTIFICADOR_EQUIPO).append("|LAB|").append(timestamp)
                .append("||ORM^O01|").append(muestra.getId()).append("|P|2.3\r");
        mensaje.append("PID|1||").append(paciente.getDocumentoIdentidad())
                .append("||").append(paciente.getNombreCompleto())
                .append("||").append(fechaNacimiento)
                .append("|").append(paciente.getSexo() != null ? paciente.getSexo() : "").append("\r");
        mensaje.append("ORC|NW|").append(muestra.getOrdenMedica().getId()).append("\r");
        mensaje.append("OBR|1||").append(muestra.getCodigoBarras())
                .append("|").append(examen.getCodigo()).append("^").append(examen.getNombre()).append("\r");

        return mensaje.toString();
    }
}
