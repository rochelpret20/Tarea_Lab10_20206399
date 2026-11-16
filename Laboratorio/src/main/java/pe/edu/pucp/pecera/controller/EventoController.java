package pe.edu.pucp.pecera.controller;
import pe.edu.pucp.pecera.model.Evento;
import pe.edu.pucp.pecera.repository.EventoRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/eventos")
public class EventoController {
 private final EventoRepository repo;
 public EventoController(EventoRepository repo) { this.repo = repo; }
 @GetMapping public List<Map<String,Object>> listar() { return repo.listar(); }
 @PostMapping public ResponseEntity<?> crear(@RequestBody Evento evento) {
  if(evento.pez()==null || evento.tipo()==null || !List.of("Nemo","Dory").contains(evento.pez()) || !List.of("boton","burbuja").contains(evento.tipo())) return ResponseEntity.badRequest().body(Map.of("error","Evento inválido"));
  repo.guardar(evento.pez(),evento.tipo()); return ResponseEntity.ok(Map.of("mensaje","Evento registrado"));
 }
}
