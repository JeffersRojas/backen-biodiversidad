package com.biodiversidad.backend.infrastructure.adapter.repository;

import com.biodiversidad.backend.domain.model.Avistamiento;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

interface AvistamientoMongoSpringRepository extends MongoRepository<Avistamiento, String> {
    List<Avistamiento> findByUsuarioId(String usuarioId);
    Optional<Avistamiento> findByIdLocal(String idLocal);
}
