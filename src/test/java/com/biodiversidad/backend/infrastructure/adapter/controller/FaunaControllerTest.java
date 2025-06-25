package com.biodiversidad.backend.infrastructure.adapter.controller;

import com.biodiversidad.backend.domain.model.Fauna;
import com.biodiversidad.backend.domain.port.in.FaunaService;
import com.biodiversidad.backend.infrastructure.controller.FaunaController;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FaunaControllerTest {
    @Test
    void testGetAllFauna() {
        FaunaService faunaService = mock(FaunaService.class);
        FaunaController controller = new FaunaController(faunaService);
        List<Fauna> faunaList = Arrays.asList(new Fauna(), new Fauna());
        when(faunaService.getAllFauna()).thenReturn(faunaList);
        ResponseEntity<List<Fauna>> response = controller.getAllFauna();
        assertEquals(200, response.getStatusCode().value());
        List<Fauna> body = response.getBody();
		assertEquals(2, body.size());
    }

    @Test
    void testGetFaunaByIdFound() {
        FaunaService faunaService = mock(FaunaService.class);
        FaunaController controller = new FaunaController(faunaService);
        Fauna fauna = new Fauna();
        when(faunaService.getFaunaById("1")).thenReturn(Optional.of(fauna));
        ResponseEntity<Fauna> response = controller.getFaunaById("1");
        assertEquals(200, response.getStatusCode().value());
        assertEquals(fauna, response.getBody());
    }

    @Test
    void testGetFaunaByIdNotFound() {
        FaunaService faunaService = mock(FaunaService.class);
        FaunaController controller = new FaunaController(faunaService);
        when(faunaService.getFaunaById("1")).thenReturn(Optional.empty());
        ResponseEntity<Fauna> response = controller.getFaunaById("1");
        assertEquals(404, response.getStatusCode().value());
    }
}
