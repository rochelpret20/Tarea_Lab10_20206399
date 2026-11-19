package com.ejercicio.lectura;

import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Expone la consulta y el registro de eventos al navegador.
@RestController
@RequestMapping("/api/eventos")
public class EventoController {
    private final EventoRepository repositorio;

    public EventoController(EventoRepository repositorio) {
        this.repositorio = repositorio;
    }

    @GetMapping
    public List<Map<String, Object>> listar() {
        return repositorio.listar();
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> guardar(@RequestBody EventoLectura evento) {
        if (evento.titulo() == null || evento.titulo().isBlank()
                || evento.titulo().trim().length() > 120) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Título inválido"));
        }
        repositorio.guardar(evento.titulo().trim());
        return ResponseEntity.ok(Map.of("mensaje", "Evento registrado"));
    }
}
