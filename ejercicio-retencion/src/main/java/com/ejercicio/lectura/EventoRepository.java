package com.ejercicio.lectura;

import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

// Accede a la tabla de eventos usando consultas parametrizadas.
@Repository
public class EventoRepository {
    private final JdbcTemplate jdbc;

    public EventoRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void guardar(String titulo) {
        jdbc.update("INSERT INTO eventos_lectura (titulo) VALUES (?)", titulo);
    }

    public List<Map<String, Object>> listar() {
        return jdbc.queryForList(
            "SELECT id, titulo, fecha FROM eventos_lectura ORDER BY id DESC LIMIT 20"
        );
    }
}
