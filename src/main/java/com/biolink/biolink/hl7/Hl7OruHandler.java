package com.biolink.biolink.hl7;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.model.AbstractMessage;
import ca.uhn.hl7v2.model.Message;
import ca.uhn.hl7v2.protocol.ReceivingApplication;
import ca.uhn.hl7v2.protocol.ReceivingApplicationException;
import ca.uhn.hl7v2.util.Terser;
import com.biolink.biolink.model.Equipo;
import com.biolink.biolink.model.EventoHl7;
import com.biolink.biolink.model.Muestra;
import com.biolink.biolink.model.Resultado;
import com.biolink.biolink.repository.EquipoRepository;
import com.biolink.biolink.repository.EventoHl7Repository;
import com.biolink.biolink.repository.MuestraRepository;
import com.biolink.biolink.service.ResultadoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Procesa mensajes ORU^R01 (resultado de laboratorio) que llegan por MLLP.
 *
 * Mapeo esperado del mensaje:
 *  - OBR-3 (Filler Order Number) -> Muestra.codigoBarras
 *  - OBX-5 (Observation Value)   -> Resultado.valorObtenido
 *
 * Si la muestra no existe o el valor no es numérico, se responde con un
 * NAK (rechazo) en vez de ACK, para que el equipo sepa que algo falló.
 *
 * Además, cada mensaje que entra actualiza el registro del Equipo que lo
 * mandó (para saber si está "conectado") y queda guardado como EventoHl7
 * en el historial de actividad.
 */
@Component
public class Hl7OruHandler implements ReceivingApplication<Message> {

    private static final Logger log = LoggerFactory.getLogger(Hl7OruHandler.class);

    @Autowired
    private MuestraRepository muestraRepository;

    @Autowired
    private ResultadoService resultadoService;

    @Autowired
    private EquipoRepository equipoRepository;

    @Autowired
    private EventoHl7Repository eventoHl7Repository;

    @Override
    public boolean canProcess(Message message) {
        try {
            Terser terser = new Terser(message);
            String tipoMensaje = terser.get("/MSH-9-1");
            return "ORU".equals(tipoMensaje);
        } catch (HL7Exception e) {
            return false;
        }
    }

    @Override
    public Message processMessage(Message message, Map<String, Object> metadata)
            throws ReceivingApplicationException {
        try {
            Terser terser = new Terser(message);

            Equipo equipo = registrarConexionEquipo(terser);

            String codigoBarrasMuestra = terser.get("/.OBR-3-1");
            String valorTexto = terser.get("/.OBX-5-1");

            log.info("ORU recibido -> muestra: {}, valor: {}", codigoBarrasMuestra, valorTexto);

            if (codigoBarrasMuestra == null || codigoBarrasMuestra.isBlank()) {
                registrarEvento(equipo, null, null, "Rechazado: el mensaje no trae código de muestra (OBR-3)");
                return rechazar(message, "El mensaje no trae código de muestra (OBR-3)");
            }

            Muestra muestra = muestraRepository.findByCodigoBarras(codigoBarrasMuestra)
                    .orElse(null);

            if (muestra == null) {
                registrarEvento(equipo, null, null, "Rechazado: no existe una muestra con código " + codigoBarrasMuestra);
                return rechazar(message, "No existe una muestra con código: " + codigoBarrasMuestra);
            }

            BigDecimal valor;
            try {
                valor = new BigDecimal(valorTexto);
            } catch (NumberFormatException e) {
                registrarEvento(equipo, muestra.getId(), null, "Rechazado: valor no numérico (" + valorTexto + ")");
                return rechazar(message, "El valor del resultado no es numérico: " + valorTexto);
            }

            Resultado resultadoEntrante = new Resultado();
            resultadoEntrante.setMuestra(muestra);
            resultadoEntrante.setValorObtenido(valor);
            resultadoEntrante.setFechaResultado(LocalDateTime.now());

            Resultado resultadoGuardado = resultadoService.crearResultado(resultadoEntrante);

            log.info("Resultado guardado con id {} y estado {}",
                    resultadoGuardado.getId(), resultadoGuardado.getEstado());

            registrarEvento(equipo, muestra.getId(), resultadoGuardado.getId(),
                    "Resultado " + valor + " para muestra " + codigoBarrasMuestra);

            return message.generateACK();

        } catch (Exception e) {
            log.error("Error procesando mensaje ORU", e);
            try {
                return rechazar(message, "Error interno procesando el mensaje: " + e.getMessage());
            } catch (Exception ex) {
                throw new ReceivingApplicationException(ex);
            }
        }
    }

    /**
     * Busca (o crea) el Equipo que mandó este mensaje, identificándolo por
     * MSH-3 (o MSH-4 si MSH-3 viene vacío), y actualiza su ultimaConexion.
     * Nunca lanza excepción hacia afuera: si algo falla acá no debe tumbar
     * el procesamiento del mensaje HL7 en sí.
     */
    private Equipo registrarConexionEquipo(Terser terser) {
        try {
            String identificador = terser.get("/MSH-3-1");
            if (identificador == null || identificador.isBlank()) {
                identificador = terser.get("/MSH-4-1");
            }
            if (identificador == null || identificador.isBlank()) {
                identificador = "DESCONOCIDO";
            }

            String identificadorFinal = identificador;
            Equipo equipo = equipoRepository.findByIdentificadorHl7(identificadorFinal)
                    .orElseGet(() -> {
                        Equipo nuevo = new Equipo();
                        nuevo.setIdentificadorHl7(identificadorFinal);
                        nuevo.setNombre(identificadorFinal);
                        return nuevo;
                    });
            equipo.setUltimaConexion(LocalDateTime.now());
            return equipoRepository.save(equipo);
        } catch (Exception e) {
            log.warn("No se pudo registrar la conexión del equipo: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Guarda un EventoHl7 de tipo ENTRANTE. Tampoco debe tumbar el
     * procesamiento del mensaje si falla.
     */
    private void registrarEvento(Equipo equipo, Long muestraId, Long resultadoId, String resumen) {
        try {
            EventoHl7 evento = new EventoHl7();
            evento.setEquipo(equipo);
            evento.setTipoMensaje("ORU^R01");
            evento.setDireccion("ENTRANTE");
            evento.setFecha(LocalDateTime.now());
            evento.setMuestraId(muestraId);
            evento.setResultadoId(resultadoId);
            evento.setResumen(resumen);
            eventoHl7Repository.save(evento);
        } catch (Exception e) {
            log.warn("No se pudo guardar el evento HL7: {}", e.getMessage());
        }
    }

    private Message rechazar(Message message, String motivo) throws HL7Exception, IOException {
        log.warn("Mensaje ORU rechazado: {}", motivo);
        return ((AbstractMessage) message).generateACK(
                ca.uhn.hl7v2.AcknowledgmentCode.AE,
                new HL7Exception(motivo)
        );
    }
}
