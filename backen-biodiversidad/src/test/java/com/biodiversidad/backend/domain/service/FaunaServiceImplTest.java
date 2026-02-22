package com.biodiversidad.backend.domain.service;

import com.biodiversidad.backend.domain.model.Fauna;
import com.biodiversidad.backend.domain.port.out.FaunaRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FaunaServiceImplTest {

    @Test
    void getAllFauna_devuelveListaEspecies() {
        FaunaRepository faunaRepository = Mockito.mock(FaunaRepository.class);
        FaunaServiceImpl faunaService = new FaunaServiceImpl(faunaRepository);

        List<Fauna> especies = List.of(
                new Fauna("1", "Jaguar", "Panthera onca", "Felidae", "En Peligro", "Selva", "Amazonía"),
                new Fauna("2", "Cóndor", "Vultur gryphus", "Cathartidae", "Vulnerable", "Alta montaña", "Andes")
        );

        when(faunaRepository.findAll()).thenReturn(especies);

        List<Fauna> resultado = faunaService.getAllFauna();

        assertEquals(2, resultado.size());
        assertEquals("Jaguar", resultado.get(0).getNombreComun());
        verify(faunaRepository).findAll();
    }

    @Test
    void getFaunaById_devuelveEspecieCuandoExiste() {
        FaunaRepository faunaRepository = Mockito.mock(FaunaRepository.class);
        FaunaServiceImpl faunaService = new FaunaServiceImpl(faunaRepository);

        Fauna jaguar = new Fauna("1", "Jaguar", "Panthera onca", "Felidae", "En Peligro", "Selva", "Amazonía");

        when(faunaRepository.findById("1")).thenReturn(Optional.of(jaguar));

        Optional<Fauna> resultado = faunaService.getFaunaById("1");

        assertTrue(resultado.isPresent());
        assertEquals("Jaguar", resultado.get().getNombreComun());
        verify(faunaRepository).findById("1");
    }

    @Test
    void updateFauna_actualizaCamposCuandoExiste() {
        FaunaRepository faunaRepository = Mockito.mock(FaunaRepository.class);
        FaunaServiceImpl faunaService = new FaunaServiceImpl(faunaRepository);

        Fauna existente = new Fauna("1", "Jaguar", "Panthera onca", "Felidae", "En Peligro", "Selva", "Amazonía");
        Fauna nuevo = new Fauna(null, "Jaguar Negro", "Panthera onca", "Felidae", "Critico", "Selva densa", "Amazonía");

        when(faunaRepository.findById("1")).thenReturn(Optional.of(existente));
        when(faunaRepository.save(existente)).thenReturn(existente);

        Fauna resultado = faunaService.updateFauna("1", nuevo);

        assertEquals("Jaguar Negro", resultado.getNombreComun());
        assertEquals("Critico", resultado.getPeligroExtincion());
        verify(faunaRepository).findById("1");
        verify(faunaRepository).save(existente);
    }

    @Test
    void deleteFauna_invocaDeleteEnRepositorio() {
        FaunaRepository faunaRepository = Mockito.mock(FaunaRepository.class);
        FaunaServiceImpl faunaService = new FaunaServiceImpl(faunaRepository);

        faunaService.deleteFauna("1");

        verify(faunaRepository).deleteById("1");
    }
}

