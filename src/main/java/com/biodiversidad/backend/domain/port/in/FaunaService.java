package com.biodiversidad.backend.domain.port.in;

import com.biodiversidad.backend.domain.model.Fauna;
import java.util.List;
import java.util.Optional;

/**
 * Puerto Primario (Driving Port) para los servicios de aplicación relacionados con Fauna.
 * Define las operaciones que la lógica de negocio ofrece al exterior.
 * La implementación concreta de esta interfaz estará en la capa de dominio/service.
 */
public interface FaunaService {
    List<Fauna> getAllFauna(); 
    Optional<Fauna> getFaunaById(String id); 
    Fauna createFauna(Fauna fauna); 
    Fauna updateFauna(String id, Fauna fauna); 
    void deleteFauna(String id); 
}