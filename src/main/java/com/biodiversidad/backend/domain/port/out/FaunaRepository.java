package com.biodiversidad.backend.domain.port.out;

import com.biodiversidad.backend.domain.model.Fauna;
import java.util.List;
import java.util.Optional;

/**
 * Puerto Secundario (Driven Port) para la persistencia de datos de Fauna.
 * Esta es una interfaz que define las operaciones que el dominio necesita
 * para interactuar con la base de datos, pero no se preocupa por la implementación.
 * La implementación concreta de esta interfaz estará en la capa de infraestructura (adapter).
 */
public interface FaunaRepository {
    List<Fauna> findAll(); 
    Optional<Fauna> findById(String id); 
    Fauna save(Fauna fauna); 
    void deleteById(String id); //
}