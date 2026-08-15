package com.biodiversidad.backend.infrastructure.controller;

import com.biodiversidad.backend.domain.model.Avistamiento;
import com.biodiversidad.backend.domain.port.in.AvistamientoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/avistamientos")
public class AvistamientoController {

    private final AvistamientoService avistamientoService;

    @Autowired
    public AvistamientoController(AvistamientoService avistamientoService) {
        this.avistamientoService = avistamientoService;
    }

    @GetMapping
    public ResponseEntity<List<Avistamiento>> getAllAvistamientos(Authentication auth) {
        String role = auth.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .findFirst().orElse("");
        if (role.contains("Admin")) {
            return ResponseEntity.ok(avistamientoService.getAllAvistamientos());
        }
        return ResponseEntity.ok(avistamientoService.getAvistamientosByUsuarioId(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Avistamiento> getById(@PathVariable String id) {
        return avistamientoService.getAvistamientoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Avistamiento> create(@RequestBody Avistamiento avistamiento, Authentication auth) {
        avistamiento.setUsuarioId(auth.getName());
        avistamiento.setUsuarioNombre(auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(avistamientoService.createAvistamiento(avistamiento));
    }

    @PostMapping("/batch")
    public ResponseEntity<List<Avistamiento>> createBatch(@RequestBody List<Avistamiento> avistamientos, Authentication auth) {
        for (Avistamiento av : avistamientos) {
            av.setUsuarioId(auth.getName());
            av.setUsuarioNombre(auth.getName());
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(avistamientoService.createAvistamientosBatch(avistamientos));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Avistamiento> update(@PathVariable String id, @RequestBody Avistamiento avistamiento) {
        Avistamiento updated = avistamientoService.updateAvistamiento(id, avistamiento);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        avistamientoService.deleteAvistamiento(id);
        return ResponseEntity.noContent().build();
    }
}
