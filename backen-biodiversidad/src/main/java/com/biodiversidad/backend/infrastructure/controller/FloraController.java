package com.biodiversidad.backend.infrastructure.controller;

import com.biodiversidad.backend.domain.model.Flora;
import com.biodiversidad.backend.domain.port.in.FloraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/flora")
public class FloraController {

    private final FloraService floraService;

    @Autowired
    public FloraController(FloraService floraService) {
        this.floraService = floraService;
    }

    @GetMapping
    public ResponseEntity<List<Flora>> getAllFlora() {
        return ResponseEntity.ok(floraService.getAllFlora());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Flora> getFloraById(@PathVariable String id) {
        return floraService.getFloraById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Flora> createFlora(@RequestBody Flora flora) {
        return ResponseEntity.status(HttpStatus.CREATED).body(floraService.createFlora(flora));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Flora> updateFlora(@PathVariable String id, @RequestBody Flora flora) {
        Flora updated = floraService.updateFlora(id, flora);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlora(@PathVariable String id) {
        floraService.deleteFlora(id);
        return ResponseEntity.noContent().build();
    }
}
