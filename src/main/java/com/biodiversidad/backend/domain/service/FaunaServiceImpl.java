package com.biodiversidad.backend.domain.service;

import com.biodiversidad.backend.domain.model.Fauna;
import com.biodiversidad.backend.domain.port.in.FaunaService;
import com.biodiversidad.backend.domain.port.out.FaunaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

/**
 * Implementación de los casos de uso para la entidad Fauna.
 * Esta clase implementa el puerto primario FaunaService y utiliza el puerto secundario FaunaRepository.
 * Aquí reside la lógica de negocio específica para Fauna.
 * @Service: Anotación de Spring para indicar que esta clase es un componente de servicio.
 */
@Service
public class FaunaServiceImpl implements FaunaService {

    private final FaunaRepository faunaRepository;

    @Autowired 
    public FaunaServiceImpl(FaunaRepository faunaRepository) {
        this.faunaRepository = faunaRepository;
    }

    @Override
    public List<Fauna> getAllFauna() {
        return faunaRepository.findAll();
    }

    @Override
    public Optional<Fauna> getFaunaById(String id) {
        return faunaRepository.findById(id);
    }

    @Override
    public Fauna createFauna(Fauna fauna) {

        return faunaRepository.save(fauna);
    }

    @Override
    public Fauna updateFauna(String id, Fauna updatedFauna) {
        return faunaRepository.findById(id)
                .map(fauna -> {
                    fauna.setNombreComun(updatedFauna.getNombreComun());
                    fauna.setNombreCientifico(updatedFauna.getNombreCientifico());
                    fauna.setFamilia(updatedFauna.getFamilia());
                    fauna.setPeligroExtincion(updatedFauna.getPeligroExtincion());
                    fauna.setHabitat(updatedFauna.getHabitat());
                    fauna.setUbicacionGeografica(updatedFauna.getUbicacionGeografica());
                   
                    return faunaRepository.save(fauna);
                })
                .orElse(null); 
    }

    @Override
    public void deleteFauna(String id) {
        faunaRepository.deleteById(id);
    }
}