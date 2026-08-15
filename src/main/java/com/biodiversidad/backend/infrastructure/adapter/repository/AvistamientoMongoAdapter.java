package com.biodiversidad.backend.infrastructure.adapter.repository;

import com.biodiversidad.backend.domain.model.Avistamiento;
import com.biodiversidad.backend.domain.port.out.AvistamientoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class AvistamientoMongoAdapter implements AvistamientoRepository {

    private final AvistamientoMongoSpringRepository springRepository;

    @Autowired
    public AvistamientoMongoAdapter(AvistamientoMongoSpringRepository springRepository) {
        this.springRepository = springRepository;
    }

    @Override
    public List<Avistamiento> findAll() {
        return springRepository.findAll();
    }

    @Override
    public List<Avistamiento> findByUsuarioId(String usuarioId) {
        return springRepository.findByUsuarioId(usuarioId);
    }

    @Override
    public Optional<Avistamiento> findById(String id) {
        return springRepository.findById(id);
    }

    @Override
    public Optional<Avistamiento> findByIdLocal(String idLocal) {
        return springRepository.findByIdLocal(idLocal);
    }

    @Override
    public Avistamiento save(Avistamiento avistamiento) {
        return springRepository.save(avistamiento);
    }

    @Override
    public List<Avistamiento> saveAll(List<Avistamiento> avistamientos) {
        return springRepository.saveAll(avistamientos);
    }

    @Override
    public void deleteById(String id) {
        springRepository.deleteById(id);
    }
}
