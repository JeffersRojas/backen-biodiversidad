package com.biodiversidad.backend.infrastructure.adapter.repository;

import com.biodiversidad.backend.domain.model.User;
import com.biodiversidad.backend.domain.port.out.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Interfaz de Spring Data MongoDB para operaciones CRUD de Usuario.
 * Spring Data genera automáticamente la implementación.
 */
interface UserMongoSpringRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
}

/**
 * Adaptador Secundario (Driven Adapter) que implementa el puerto UserRepository.
 * Se encarga de la comunicación con MongoDB para la entidad User.
 */
@Repository
public class UserMongoAdapter implements UserRepository {

    private final UserMongoSpringRepository userMongoSpringRepository;

    @Autowired
    public UserMongoAdapter(UserMongoSpringRepository userMongoSpringRepository) {
        this.userMongoSpringRepository = userMongoSpringRepository;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userMongoSpringRepository.findByEmail(email);
    }

    @Override
    public Optional<User> findById(String id) {
        return userMongoSpringRepository.findById(id);
    }

    @Override
    public User save(User user) {
        return userMongoSpringRepository.save(user);
    }

    @Override
    public void deleteById(String id) {
        userMongoSpringRepository.deleteById(id);
    }

    @Override
    public List<User> findAll() {
        return userMongoSpringRepository.findAll();
    }
}
