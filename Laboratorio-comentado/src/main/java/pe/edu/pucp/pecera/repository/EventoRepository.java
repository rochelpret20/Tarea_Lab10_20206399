package pe.edu.pucp.pecera.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;

// Encapsula las consultas SQL de los eventos.
@Repository
public class EventoRepository {
    private final JdbcTemplate jdbc;

    // Recibe la herramienta de Spring para ejecutar consultas SQL.
    public EventoRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Inserta un evento usando parámetros para el pez y el tipo.
    public void guardar(String pez, String tipo) {
        jdbc.update("INSERT INTO eventos (pez,tipo) VALUES (?,?)", pez, tipo);
    }

    // Obtiene como máximo los 30 eventos más recientes.
    public List<Map<String, Object>> listar() {
        return jdbc.queryForList("SELECT id,pez,tipo,fecha FROM eventos ORDER BY id DESC LIMIT 30");
    }
}
