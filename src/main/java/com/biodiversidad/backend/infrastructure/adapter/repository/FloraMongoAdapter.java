package com.biodiversidad.backend.infrastructure.adapter.repository;

import com.biodiversidad.backend.domain.model.Flora;
import com.biodiversidad.backend.domain.port.out.FloraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public class FloraMongoAdapter implements FloraRepository {

    private final FloraMongoSpringRepository floraMongoSpringRepository;

    @Autowired
    public FloraMongoAdapter(FloraMongoSpringRepository floraMongoSpringRepository) {
        this.floraMongoSpringRepository = floraMongoSpringRepository;
    }

    @Override
    public List<Flora> findAll() {
        return floraMongoSpringRepository.findAll();
    }

    @Override
    public Optional<Flora> findById(String id) {
        return floraMongoSpringRepository.findById(id);
    }

    @Override
    public Flora save(Flora flora) {
        return floraMongoSpringRepository.save(flora);
    }

    @Override
    public void deleteById(String id) {
        floraMongoSpringRepository.deleteById(id);
    }
}
