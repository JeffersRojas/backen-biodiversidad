package com.biodiversidad.backend.domain.service;

import com.biodiversidad.backend.domain.model.Flora;
import com.biodiversidad.backend.domain.port.in.FloraService;
import com.biodiversidad.backend.domain.port.out.FloraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class FloraServiceImpl implements FloraService {

    private final FloraRepository floraRepository;

    @Autowired
    public FloraServiceImpl(FloraRepository floraRepository) {
        this.floraRepository = floraRepository;
    }

    @Override
    public List<Flora> getAllFlora() {
        return floraRepository.findAll();
    }

    @Override
    public Optional<Flora> getFloraById(String id) {
        return floraRepository.findById(id);
    }

    @Override
    public Flora createFlora(Flora flora) {
        return floraRepository.save(flora);
    }

    @Override
    public Flora updateFlora(String id, Flora updatedFlora) {
        return floraRepository.findById(id)
                .map(flora -> {
                    flora.setNombreComun(updatedFlora.getNombreComun());
                    flora.setNombreCientifico(updatedFlora.getNombreCientifico());
                    flora.setFamilia(updatedFlora.getFamilia());
                    flora.setTipo(updatedFlora.getTipo());
                    flora.setEstadoConservacion(updatedFlora.getEstadoConservacion());
                    flora.setHabitat(updatedFlora.getHabitat());
                    flora.setUbicacionGeografica(updatedFlora.getUbicacionGeografica());
                    return floraRepository.save(flora);
                })
                .orElse(null);
    }

    @Override
    public void deleteFlora(String id) {
        floraRepository.deleteById(id);
    }
}
