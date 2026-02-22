package com.biodiversidad.backend.domain.port.out;

import com.biodiversidad.backend.domain.model.User;
import java.util.Optional;
import java.util.List;

/**
 * Puerto Secundario (Driven Port) para la persistencia de datos de Usuarios.
 * Define las operaciones necesarias para gestionar usuarios en la base de datos.
 */
public interface UserRepository {
    Optional<User> findByEmail(String email);
    Optional<User> findById(String id);
    User save(User user);
    void deleteById(String id);
    List<User> findAll();
}