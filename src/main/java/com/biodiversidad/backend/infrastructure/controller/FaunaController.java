package com.biodiversidad.backend.infrastructure.controller;

import com.biodiversidad.backend.domain.model.Fauna;
import com.biodiversidad.backend.domain.port.in.FaunaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Adaptador Primario (Driving Adapter) para la API REST de Fauna.
 * Esta clase expone los endpoints HTTP para las operaciones CRUD de Fauna.
 * Delega la lógica de negocio al puerto primario FaunaService.
 * @RestController: Anotación de Spring que combina @Controller y @ResponseBody.
 * Indica que esta clase es un controlador REST y que los métodos devuelven datos directamente.
 * @RequestMapping: Mapea solicitudes HTTP a métodos manejadores.
 */
@RestController
@RequestMapping("/api/fauna") // Prefijo para todos los endpoints de este controlador
public class FaunaController {

    private final FaunaService faunaService;

    @Autowired // Inyección de dependencia
    public FaunaController(FaunaService faunaService) {
        this.faunaService = faunaService;
    }

    /**
     * Obtiene todas las especies de fauna.
     * GET /api/fauna
     * @return Lista de especies de fauna.
     */
    @GetMapping
    public ResponseEntity<List<Fauna>> getAllFauna() {
        List<Fauna> faunaList = faunaService.getAllFauna();
        return ResponseEntity.ok(faunaList);
    }

    /**
     * Obtiene una especie de fauna por su ID.
     * GET /api/fauna/{id}
     * @param id El ID de la especie de fauna.
     * @return La especie de fauna si se encuentra, o 404 NOT FOUND.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Fauna> getFaunaById(@PathVariable String id) {
        Optional<Fauna> fauna = faunaService.getFaunaById(id);
        return fauna.map(ResponseEntity::ok) // Si se encuentra, retorna 200 OK
                     .orElse(ResponseEntity.notFound().build()); // Si no, retorna 404 Not Found
    }

    /**
     * Crea una nueva especie de fauna.
     * POST /api/fauna
     * @param fauna El objeto Fauna a crear (en el cuerpo de la solicitud).
     * @return La especie de fauna creada con su ID, y 201 CREATED.
     */
    @PostMapping
    public ResponseEntity<Fauna> createFauna(@RequestBody Fauna fauna) {
        Fauna createdFauna = faunaService.createFauna(fauna);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFauna);
    }

    /**
     * Actualiza una especie de fauna existente.
     * PUT /api/fauna/{id}
     * @param id El ID de la especie de fauna a actualizar.
     * @param fauna El objeto Fauna con los datos actualizados (en el cuerpo de la solicitud).
     * @return La especie de fauna actualizada, o 404 NOT FOUND si no existe.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Fauna> updateFauna(@PathVariable String id, @RequestBody Fauna fauna) {
        Fauna updatedFauna = faunaService.updateFauna(id, fauna);
        if (updatedFauna != null) {
            return ResponseEntity.ok(updatedFauna); // Si se actualiza, retorna 200 OK
        } else {
            return ResponseEntity.notFound().build(); // Si no existe, retorna 404 Not Found
        }
    }

    /**
     * Elimina una especie de fauna por su ID.
     * DELETE /api/fauna/{id}
     * @param id El ID de la especie de fauna a eliminar.
     * @return 204 NO CONTENT si se elimina con éxito.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFauna(@PathVariable String id) {
        faunaService.deleteFauna(id);
        return ResponseEntity.noContent().build(); 
    }
}
