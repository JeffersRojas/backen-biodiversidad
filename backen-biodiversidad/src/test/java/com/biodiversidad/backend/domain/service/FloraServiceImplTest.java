package com.biodiversidad.backend.domain.service;

import com.biodiversidad.backend.domain.model.Flora;
import com.biodiversidad.backend.domain.port.out.FloraRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FloraServiceImplTest {

    @Test
    void getAllFlora_devuelveListaPlantas() {
        FloraRepository floraRepository = Mockito.mock(FloraRepository.class);
        FloraServiceImpl floraService = new FloraServiceImpl(floraRepository);

        List<Flora> plantas = List.of(
                new Flora("1", "Orquídea", "Cattleya trianae", "Orchidaceae", "Hierba", "Preocupación Menor", "Bosque húmedo", "Andes"),
                new Flora("2", "Palma de cera", "Ceroxylon quindiuense", "Arecaceae", "Árbol", "En Peligro", "Bosques andinos", "Quindío")
        );

        when(floraRepository.findAll()).thenReturn(plantas);

        List<Flora> resultado = floraService.getAllFlora();

        assertEquals(2, resultado.size());
        assertEquals("Orquídea", resultado.get(0).getNombreComun());
        verify(floraRepository).findAll();
    }

    @Test
    void getFloraById_devuelvePlantaCuandoExiste() {
        FloraRepository floraRepository = Mockito.mock(FloraRepository.class);
        FloraServiceImpl floraService = new FloraServiceImpl(floraRepository);

        Flora orquidea = new Flora("1", "Orquídea", "Cattleya trianae", "Orchidaceae", "Hierba", "Preocupación Menor", "Bosque húmedo", "Andes");

        when(floraRepository.findById("1")).thenReturn(Optional.of(orquidea));

        Optional<Flora> resultado = floraService.getFloraById("1");

        assertTrue(resultado.isPresent());
        assertEquals("Orquídea", resultado.get().getNombreComun());
        verify(floraRepository).findById("1");
    }

    @Test
    void updateFlora_actualizaCamposCuandoExiste() {
        FloraRepository floraRepository = Mockito.mock(FloraRepository.class);
        FloraServiceImpl floraService = new FloraServiceImpl(floraRepository);

        Flora existente = new Flora("1", "Orquídea", "Cattleya trianae", "Orchidaceae", "Hierba", "Preocupación Menor", "Bosque húmedo", "Andes");
        Flora nueva = new Flora(null, "Orquídea Andina", "Cattleya trianae", "Orchidaceae", "Hierba", "En Peligro", "Bosque nublado", "Andes");

        when(floraRepository.findById("1")).thenReturn(Optional.of(existente));
        when(floraRepository.save(existente)).thenReturn(existente);

        Flora resultado = floraService.updateFlora("1", nueva);

        assertEquals("Orquídea Andina", resultado.getNombreComun());
        assertEquals("En Peligro", resultado.getEstadoConservacion());
        verify(floraRepository).findById("1");
        verify(floraRepository).save(existente);
    }

    @Test
    void deleteFlora_invocaDeleteEnRepositorio() {
        FloraRepository floraRepository = Mockito.mock(FloraRepository.class);
        FloraServiceImpl floraService = new FloraServiceImpl(floraRepository);

        floraService.deleteFlora("1");

        verify(floraRepository).deleteById("1");
    }
}

