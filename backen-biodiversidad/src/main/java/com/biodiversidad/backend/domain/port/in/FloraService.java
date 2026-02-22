package com.biodiversidad.backend.domain.port.in;

import com.biodiversidad.backend.domain.model.Flora;
import java.util.List;
import java.util.Optional;

public interface FloraService {
    List<Flora> getAllFlora();
    Optional<Flora> getFloraById(String id);
    Flora createFlora(Flora flora);
    Flora updateFlora(String id, Flora flora);
    void deleteFlora(String id);
}
