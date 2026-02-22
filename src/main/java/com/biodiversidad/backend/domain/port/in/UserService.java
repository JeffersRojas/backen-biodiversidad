package com.biodiversidad.backend.domain.port.in;

import com.biodiversidad.backend.domain.model.User;
import java.util.List;
import java.util.Optional;

/**
 * Puerto Primario (Driving Port) para los servicios de aplicación relacionados con Usuarios.
 * Define las operaciones que la lógica de negocio ofrece al exterior para la gestión de usuarios.
 */
public interface UserService {
    List<User> getAllUsers();
    Optional<User> getUserById(String id);
    User createUser(User user);
    User updateUser(String id, User user);
    void deleteUser(String id);
    Optional<User> getUserByEmail(String email);
}