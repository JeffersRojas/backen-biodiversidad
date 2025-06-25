package com.biodiversidad.backend.domain.service;

import com.biodiversidad.backend.domain.model.Fauna;
import com.biodiversidad.backend.domain.port.out.FaunaRepository;
import org.junit.jupiter.api.Test;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FaunaServiceImplTest {
    @Test
    void testGetAllFauna() {
        FaunaRepository faunaRepository = mock(FaunaRepository.class);
        FaunaServiceImpl service = new FaunaServiceImpl(faunaRepository);
        List<Fauna> faunaList = Arrays.asList(new Fauna(), new Fauna());
        when(faunaRepository.findAll()).thenReturn(faunaList);
        List<Fauna> result = service.getAllFauna();
        assertEquals(2, result.size());
    }

    @Test
    void testGetFaunaByIdFound() {
        FaunaRepository faunaRepository = mock(FaunaRepository.class);
        FaunaServiceImpl service = new FaunaServiceImpl(faunaRepository);
        Fauna fauna = new Fauna();
        when(faunaRepository.findById("1")).thenReturn(Optional.of(fauna));
        Optional<Fauna> result = service.getFaunaById("1");
        assertTrue(result.isPresent());
        assertEquals(fauna, result.get());
    }

    @Test
    void testGetFaunaByIdNotFound() {
        FaunaRepository faunaRepository = mock(FaunaRepository.class);
        FaunaServiceImpl service = new FaunaServiceImpl(faunaRepository);
        when(faunaRepository.findById("1")).thenReturn(Optional.empty());
        Optional<Fauna> result = service.getFaunaById("1");
        assertFalse(result.isPresent());
    }
}
