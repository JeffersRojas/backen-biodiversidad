package com.biodiversidad.backend.infrastructure.controller;

import com.biodiversidad.backend.domain.model.User;
import com.biodiversidad.backend.domain.port.in.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Adaptador Primario (Driving Adapter) para la API REST de Usuarios.
 * Esta clase expone los endpoints HTTP para las operaciones CRUD de Usuarios.
 * Delega la lógica de negocio al puerto primario UserService.
 * @RestController: Anotación de Spring que combina @Controller y @ResponseBody.
 * Indica que esta clase es un controlador REST y que los métodos devuelven datos directamente.
 * @RequestMapping: Mapea solicitudes HTTP a métodos manejadores.
 */
@RestController
@RequestMapping("/api/users") // Prefijo para todos los endpoints de este controlador
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Obtiene todos los usuarios.
     * GET /api/users
     * @return Lista de usuarios.
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Obtiene un usuario por su ID.
     * GET /api/users/{id}
     * @param id El ID del usuario.
     * @return El usuario si se encuentra, o 404 NOT FOUND.
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Crea un nuevo usuario.
     * POST /api/users
     * @param user El objeto User a crear (en el cuerpo de la solicitud).
     * @return El usuario creado con su ID, y 201 CREATED.
     */
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        // NOTA: En un proyecto real, aquí se DEBERÍA hashear la contraseña
        // antes de guardarla en la base de datos por seguridad.
        User createdUser = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    /**
     * Actualiza un usuario existente.
     * PUT /api/users/{id}
     * @param id El ID del usuario a actualizar.
     * @param user El objeto User con los datos actualizados (en el cuerpo de la solicitud).
     * @return El usuario actualizado, o 404 NOT FOUND si no existe.
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User user) {
        User updatedUser = userService.updateUser(id, user);
        if (updatedUser != null) {
            return ResponseEntity.ok(updatedUser);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Elimina un usuario por su ID.
     * DELETE /api/users/{id}
     * @param id El ID del usuario a eliminar.
     * @return 204 NO CONTENT si se elimina con éxito.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}