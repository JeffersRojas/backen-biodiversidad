package com.biodiversidad.backend.infrastructure.adapter.repository;

import com.biodiversidad.backend.domain.model.Flora;
import org.springframework.data.mongodb.repository.MongoRepository;

interface FloraMongoSpringRepository extends MongoRepository<Flora, String> {
}
