package pe.edu.pucp.pecera.repository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;
@Repository
public class EventoRepository {
 private final JdbcTemplate jdbc;
 public EventoRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }
 public void guardar(String pez,String tipo) { jdbc.update("INSERT INTO eventos (pez,tipo) VALUES (?,?)",pez,tipo); }
 public List<Map<String,Object>> listar() { return jdbc.queryForList("SELECT id,pez,tipo,fecha FROM eventos ORDER BY id DESC LIMIT 30"); }
}
