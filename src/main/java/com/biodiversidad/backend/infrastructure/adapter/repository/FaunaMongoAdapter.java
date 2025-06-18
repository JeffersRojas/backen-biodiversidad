package com.biodiversidad.backend.infrastructure.adapter.repository;

import com.biodiversidad.backend.domain.model.Fauna;
import com.biodiversidad.backend.domain.port.out.FaunaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class FaunaMongoAdapter implements FaunaRepository {

    
    private final FaunaMongoSpringRepository faunaMongoSpringRepository;

    @Autowired 
    public FaunaMongoAdapter(FaunaMongoSpringRepository faunaMongoSpringRepository) {
        this.faunaMongoSpringRepository = faunaMongoSpringRepository;
    }

    @Override
    public List<Fauna> findAll() {
        return faunaMongoSpringRepository.findAll();
    }

    @Override
    public Optional<Fauna> findById(String id) {
        return faunaMongoSpringRepository.findById(id);
    }

    @Override
    public Fauna save(Fauna fauna) {
        return faunaMongoSpringRepository.save(fauna);
    }

    @Override
    public void deleteById(String id) {
        faunaMongoSpringRepository.deleteById(id);
    }
}