package com.biodiversidad.backend.domain.service;

import com.biodiversidad.backend.domain.model.Avistamiento;
import com.biodiversidad.backend.domain.port.in.AvistamientoService;
import com.biodiversidad.backend.domain.port.out.AvistamientoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AvistamientoServiceImpl implements AvistamientoService {

    private final AvistamientoRepository avistamientoRepository;

    @Autowired
    public AvistamientoServiceImpl(AvistamientoRepository avistamientoRepository) {
        this.avistamientoRepository = avistamientoRepository;
    }

    @Override
    public List<Avistamiento> getAllAvistamientos() {
        return avistamientoRepository.findAll();
    }

    @Override
    public List<Avistamiento> getAvistamientosByUsuarioId(String usuarioId) {
        return avistamientoRepository.findByUsuarioId(usuarioId);
    }

    @Override
    public Optional<Avistamiento> getAvistamientoById(String id) {
        return avistamientoRepository.findById(id);
    }

    @Override
    public Avistamiento createAvistamiento(Avistamiento avistamiento) {
        if (avistamiento.getFechaHoraRegistro() == null) {
            avistamiento.setFechaHoraRegistro(Instant.now());
        }
        avistamiento.setFechaHoraSincronizacion(Instant.now());
        avistamiento.setEstadoSincronizacion("SYNCED");
        return avistamientoRepository.save(avistamiento);
    }

    @Override
    public List<Avistamiento> createAvistamientosBatch(List<Avistamiento> avistamientos) {
        List<Avistamiento> resultados = new ArrayList<>();
        Instant now = Instant.now();
        for (Avistamiento av : avistamientos) {
            if (av.getIdLocal() != null && !av.getIdLocal().isBlank()) {
                Optional<Avistamiento> existente = avistamientoRepository.findByIdLocal(av.getIdLocal());
                if (existente.isPresent()) {
                    resultados.add(existente.get());
                    continue;
                }
            }
            if (av.getFechaHoraRegistro() == null) {
                av.setFechaHoraRegistro(now);
            }
            av.setFechaHoraSincronizacion(now);
            av.setEstadoSincronizacion("SYNCED");
            resultados.add(avistamientoRepository.save(av));
        }
        return resultados;
    }

    @Override
    public Avistamiento updateAvistamiento(String id, Avistamiento updatedAv) {
        return avistamientoRepository.findById(id)
                .map(av -> {
                    av.setCategoria(updatedAv.getCategoria());
                    av.setReino(updatedAv.getReino());
                    av.setFilo(updatedAv.getFilo());
                    av.setClase(updatedAv.getClase());
                    av.setNombreComun(updatedAv.getNombreComun());
                    av.setNombreCientifico(updatedAv.getNombreCientifico());
                    av.setFamilia(updatedAv.getFamilia());
                    av.setCantidadIndividuos(updatedAv.getCantidadIndividuos());
                    av.setNotasObservacion(updatedAv.getNotasObservacion());
                    av.setLatitud(updatedAv.getLatitud());
                    av.setLongitud(updatedAv.getLongitud());
                    av.setPrecisionGpsMetros(updatedAv.getPrecisionGpsMetros());
                    av.setFotosBase64(updatedAv.getFotosBase64());
                    return avistamientoRepository.save(av);
                })
                .orElse(null);
    }

    @Override
    public void deleteAvistamiento(String id) {
        avistamientoRepository.deleteById(id);
    }
}
