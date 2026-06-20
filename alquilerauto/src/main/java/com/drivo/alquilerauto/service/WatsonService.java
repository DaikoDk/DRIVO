package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.config.WatsonConfig;
import com.drivo.alquilerauto.dto.watson.WatsonResponse;
import com.drivo.alquilerauto.entity.Auto;
import com.drivo.alquilerauto.entity.Cliente;
import com.drivo.alquilerauto.entity.Reserva;
import com.drivo.alquilerauto.repository.AutoRepository;
import com.drivo.alquilerauto.repository.ClienteRepository;
import com.drivo.alquilerauto.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WatsonService {

    private final WatsonConfig watsonConfig;
    private final AutoRepository autoRepository;
    private final ClienteRepository clienteRepository;
    private final ReservaRepository reservaRepository;

    private static final Map<String, String> KEYWORDS = new LinkedHashMap<>();
    static {
        KEYWORDS.put("hola|buenas|buen[oa]s|saludos|hey", "saludo");
        KEYWORDS.put("adi[oó]s|gracias|chau|bye|hasta luego|nos vemos", "despedida");
        KEYWORDS.put("auto[s]? disponible[s]?|que tienen|cat[áa]logo|listado|veh[ií]culo[s]?", "disponibles");
        KEYWORDS.put("suv|todo terreno|camioneta", "categoria_suv");
        KEYWORDS.put("sed[aá]n|auto chico|econ[oó]mico|barato", "categoria_sedan");
        KEYWORDS.put("hatchback|compacto|peque[nñ]o", "categoria_hatchback");
        KEYWORDS.put("pickup|camioneta de carga", "categoria_pickup");
        KEYWORDS.put("precio|cu[áa]nto cuesta|tarifa|costo|alquiler", "precios");
        KEYWORDS.put("reservar|alquilar|rentar|quiero", "reservar");
        KEYWORDS.put("mis reservas|mis reservaciones|mis alquileres", "mis_reservas");
        KEYWORDS.put("pagar|pago|factura|cuenta", "pagar");
        KEYWORDS.put("cancelar|anular", "cancelar");
        KEYWORDS.put("ayuda|que puedes hacer|opciones|menu", "ayuda");
        KEYWORDS.put("marca|marcas|modelo|modelos", "marcas_modelos");
        KEYWORDS.put("perfil|mis datos|mi cuenta", "perfil");
    }

    public WatsonResponse procesarMensaje(String mensaje, String correoUsuario) {
        if (!watsonConfig.isOffline()) {
            return llamarWatsonReal(mensaje);
        }
        return procesarOffline(mensaje.toLowerCase(Locale.ROOT), correoUsuario);
    }

    private WatsonResponse procesarOffline(String mensaje, String correoUsuario) {
        String categoria = null;
        for (var entry : KEYWORDS.entrySet()) {
            if (mensaje.matches(".*(" + entry.getKey() + ").*")) {
                categoria = entry.getValue();
                break;
            }
        }

        if (categoria == null) {
            return WatsonResponse.of(
                "No entendí tu mensaje. Puedes preguntarme cosas como:\n" +
                "• \"¿Qué autos tienen disponibles?\"\n" +
                "• \"¿Cuánto cuesta alquilar?\"\n" +
                "• \"Mis reservas\"\n" +
                "• \"Quiero reservar un auto\"\n" +
                "• \"Ayuda\"",
                List.of("ayuda")
            );
        }

        return switch (categoria) {
            case "saludo" -> WatsonResponse.of(
                "¡Hola! Soy el asistente virtual de DRIVO Rent-a-Car. 🚗\n\n" +
                "Puedes preguntarme:\n" +
                "• Qué autos tenemos disponibles\n" +
                "• Precios y tarifas\n" +
                "• Información sobre tus reservas\n" +
                "• Cómo reservar un vehículo\n\n" +
                "¿En qué puedo ayudarte?",
                List.of("disponibles", "precios", "ayuda")
            );
            case "despedida" -> WatsonResponse.of(
                "¡Gracias por contactarnos! Si necesitas algo más, estoy aquí para ayudar. 🚗✨\n\n" +
                "¡Buen viaje!"
            );
            case "disponibles" -> {
                List<Auto> disponibles = autoRepository.findByActivoTrueAndEstado("Disponible");
                if (disponibles.isEmpty()) {
                    yield WatsonResponse.of(
                        "Actualmente no tenemos autos disponibles. 😕\n" +
                        "Puedes revisar el catálogo más tarde o contactarnos al +51 999 888 777."
                    );
                }
                String lista = disponibles.stream()
                    .limit(6)
                    .map(a -> "• " + a.getMarca().getNombre() + " " + a.getModelo().getNombre()
                        + " (" + a.getAnio() + ") - S/" + String.format("%.0f", a.getPrecioPorDia()) + "/día")
                    .collect(Collectors.joining("\n"));
                int resto = disponibles.size() - 6;
                String restoStr = resto > 0 ? "\n\nY " + resto + " más en nuestro catálogo." : "";
                yield WatsonResponse.of(
                    "Tenemos " + disponibles.size() + " autos disponibles:\n\n" + lista + restoStr +
                    "\n\n¿Quieres ver más detalles de algún modelo en específico?",
                    List.of("categoria_suv", "categoria_sedan", "precios")
                );
            }
            case "categoria_suv" -> responderPorCategoria("SUV");
            case "categoria_sedan" -> responderPorCategoria("Sedán");
            case "categoria_hatchback" -> responderPorCategoria("Hatchback");
            case "categoria_pickup" -> responderPorCategoria("Pickup");
            case "precios" -> {
                List<Auto> autos = autoRepository.findByActivoTrue();
                if (autos.isEmpty()) {
                    yield WatsonResponse.of("No tenemos información de precios disponible.");
                }
                String mini = autos.stream()
                    .min(Comparator.comparing(Auto::getPrecioPorDia))
                    .map(a -> "Desde S/" + String.format("%.0f", a.getPrecioPorDia()) + "/día (" + a.getMarca().getNombre() + " " + a.getModelo().getNombre() + ")")
                    .orElse("");
                yield WatsonResponse.of(
                    "Nuestras tarifas:\n\n" +
                    "💲 Precios desde S/95/día hasta S/180/día\n" +
                    "⏰ Tarifa por hora desde S/11/h\n" +
                    "⚠️ Mora por retraso: desde S/20/día\n\n" +
                    mini + "\n\n" +
                    "Cada auto incluye:\n" +
                    "• Kilometraje sin límite\n" +
                    "• Seguro básico incluido\n" +
                    "• Asistencia en carretera\n\n" +
                    "¿Quieres ver los autos disponibles?",
                    List.of("disponibles", "categoria_suv", "categoria_sedan")
                );
            }
            case "reservar" -> WatsonResponse.of(
                "Para reservar un auto:\n\n" +
                "1️⃣ Navega al Catálogo desde el menú\n" +
                "2️⃣ Elige el auto que te guste\n" +
                "3️⃣ Selecciona fechas y horas\n" +
                "4️⃣ Confirma tu reserva\n\n" +
                "💡 Tip: Puedes ver la disponibilidad en tiempo real.\n" +
                "¿Quieres ir al catálogo ahora?",
                List.of("disponibles", "precios")
            );
            case "mis_reservas" -> {
                if (correoUsuario == null) {
                    yield WatsonResponse.of(
                        "Para ver tus reservas necesitas iniciar sesión primero. 🔐\n\n" +
                        "Si ya iniciaste sesión, ve a \"Mis Reservas\" en el menú.",
                        List.of("ayuda")
                    );
                }
                Optional<Cliente> clienteOpt = clienteRepository.findByUsuarioCorreo(correoUsuario);
                if (clienteOpt.isEmpty()) {
                    yield WatsonResponse.of("No encontramos tu perfil de cliente.");
                }
                List<Reserva> reservas = reservaRepository.findByClienteIdCliente(clienteOpt.get().getIdCliente());
                if (reservas.isEmpty()) {
                    yield WatsonResponse.of(
                        "No tienes reservas registradas. 📋\n\n¿Quieres ver nuestros autos disponibles?",
                        List.of("disponibles")
                    );
                }
                String listaReservas = reservas.stream()
                    .limit(5)
                    .map(r -> "• " + r.getAuto().getMarca().getNombre() + " " + r.getAuto().getModelo().getNombre()
                        + " | " + r.getFechaInicio() + " → " + r.getFechaFin()
                        + " | Estado: " + r.getEstado().getNombre())
                    .collect(Collectors.joining("\n"));
                int restoR = reservas.size() - 5;
                String restoRStr = restoR > 0 ? "\n\nY " + restoR + " más." : "";
                yield WatsonResponse.of(
                    "Tus reservas (" + reservas.size() + "):\n\n" + listaReservas + restoRStr +
                    "\n\nVe a \"Mis Reservas\" para más detalles o gestionarlas.",
                    List.of("disponibles", "pagar")
                );
            }
            case "pagar" -> WatsonResponse.of(
                "Para realizar un pago:\n\n" +
                "• Los pagos se gestionan al recoger y devolver el auto\n" +
                "• Métodos aceptados: Tarjeta, Efectivo, Transferencia\n" +
                "• Puedes ver el detalle en tus reservas\n\n" +
                "¿Tienes alguna duda sobre los costos?",
                List.of("precios", "mis_reservas")
            );
            case "cancelar" -> WatsonResponse.of(
                "Para cancelar una reserva:\n\n" +
                "1️⃣ Ve a \"Mis Reservas\" en el menú\n" +
                "2️⃣ Selecciona la reserva que deseas cancelar\n" +
                "3️⃣ Haz clic en \"Cancelar reserva\"\n\n" +
                "⚠️ Solo puedes cancelar reservas en estado Pendiente o Confirmada.",
                List.of("mis_reservas")
            );
            case "marcas_modelos" -> {
                List<Auto> autos = autoRepository.findByActivoTrue();
                Set<String> marcas = autos.stream()
                    .map(a -> a.getMarca().getNombre())
                    .collect(Collectors.toCollection(LinkedHashSet::new));
                yield WatsonResponse.of(
                    "Trabajamos con las siguientes marcas:\n\n" +
                    String.join(", ", marcas) + "\n\n" +
                    "¿Quieres ver los autos disponibles de alguna marca o categoría?",
                    List.of("disponibles", "categoria_suv", "categoria_sedan")
                );
            }
            case "perfil" -> WatsonResponse.of(
                "Puedes ver y editar tu perfil en \"Mi Perfil\" desde el menú. 📝\n\n" +
                "Allí puedes:\n" +
                "• Actualizar tus datos personales\n" +
                "• Cambiar tu contraseña\n" +
                "• Ver tu licencia de conducir\n" +
                "• Cerrar sesión",
                List.of("mis_reservas")
            );
            case "ayuda" -> WatsonResponse.of(
                "🤖 Soy el asistente virtual de DRIVO.\n\n" +
                "Puedes preguntarme:\n" +
                "🚗 \"Autos disponibles\" — Ver el catálogo\n" +
                "💰 \"Precios\" — Información de tarifas\n" +
                "📋 \"Mis reservas\" — Tus alquileres activos\n" +
                "❓ \"Cómo reservar\" — Pasos para alquilar\n" +
                "📞 \"Contacto\" — Información de la empresa\n\n" +
                "¿En qué más puedo ayudarte?"
            );
            default -> WatsonResponse.of(
                "Disculpa, no entendí bien. ¿Puedes reformular tu pregunta?\n\n" +
                "Palabras clave que reconozco: autos, precios, reservas, pagos, ayuda.",
                List.of("ayuda")
            );
        };
    }

    private WatsonResponse responderPorCategoria(String categoria) {
        List<Auto> autos = autoRepository.findByActivoTrue();
        List<Auto> filtrados = autos.stream()
            .filter(a -> a.getModelo().getCategoria() != null
                && a.getModelo().getCategoria().equalsIgnoreCase(categoria))
            .toList();

        if (filtrados.isEmpty()) {
            return WatsonResponse.of(
                "No tenemos autos de categoría " + categoria + " disponibles actualmente.\n" +
                "¿Quieres ver otras categorías?",
                List.of("disponibles", "categoria_sedan", "categoria_hatchback")
            );
        }

        String lista = filtrados.stream()
            .map(a -> "• " + a.getMarca().getNombre() + " " + a.getModelo().getNombre()
                + " (" + a.getAnio() + ") - S/" + String.format("%.0f", a.getPrecioPorDia()) + "/día"
                + (a.getEstado().equals("Disponible") ? " ✅ Disponible" : " 🔒 " + a.getEstado()))
            .collect(Collectors.joining("\n"));

        return WatsonResponse.of(
            "Autos " + categoria + " (" + filtrados.size() + "):\n\n" + lista +
            "\n\n¿Quieres ver más detalles o reservar alguno?",
            List.of("disponibles", "precios", "reservar")
        );
    }

    private WatsonResponse llamarWatsonReal(String mensaje) {
        try {
            RestTemplate rest = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Basic " + Base64.getEncoder()
                .encodeToString((watsonConfig.getApiKey() + ":").getBytes()));

            Map<String, Object> body = new HashMap<>();
            body.put("input", Map.of("text", mensaje));
            body.put("assistant_id", watsonConfig.getAssistantId());

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = rest.postForEntity(
                watsonConfig.getUrl() + "/v2/assistants/" + watsonConfig.getAssistantId() + "/sessions",
                request, Map.class);

            if (response.getBody() != null) {
                String sessionId = (String) response.getBody().get("session_id");
                Map<String, Object> msgBody = Map.of("input", Map.of("text", mensaje));
                HttpEntity<Map<String, Object>> msgRequest = new HttpEntity<>(msgBody, headers);
                ResponseEntity<Map> msgResponse = rest.postForEntity(
                    watsonConfig.getUrl() + "/v2/assistants/" + watsonConfig.getAssistantId()
                        + "/sessions/" + sessionId + "/message",
                    msgRequest, Map.class);

                if (msgResponse.getBody() != null) {
                    Map<String, Object> output = (Map<String, Object>) msgResponse.getBody().get("output");
                    if (output != null) {
                        List<Map<String, Object>> generic = (List<Map<String, Object>>) output.get("generic");
                        if (generic != null && !generic.isEmpty()) {
                            String text = (String) generic.get(0).get("text");
                            if (text != null) {
                                return new WatsonResponse(text, List.of(), false);
                            }
                        }
                    }
                }
            }
            return WatsonResponse.of("Lo siento, no pude procesar tu mensaje en este momento.");
        } catch (Exception e) {
            return WatsonResponse.of("Error de conexión con el asistente. Intenta de nuevo más tarde.");
        }
    }
}
