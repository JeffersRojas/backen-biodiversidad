package com.biodiversidad.backend.domain.port.in;

import com.biodiversidad.backend.domain.model.Avistamiento;
import java.util.List;
import java.util.Optional;

public interface AvistamientoService {
    List<Avistamiento> getAllAvistamientos();
    List<Avistamiento> getAvistamientosByUsuarioId(String usuarioId);
    Optional<Avistamiento> getAvistamientoById(String id);
    Avistamiento createAvistamiento(Avistamiento avistamiento);
    List<Avistamiento> createAvistamientosBatch(List<Avistamiento> avistamientos);
    Avistamiento updateAvistamiento(String id, Avistamiento avistamiento);
    void deleteAvistamiento(String id);
}
