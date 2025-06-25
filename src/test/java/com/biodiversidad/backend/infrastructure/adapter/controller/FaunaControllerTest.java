package com.biodiversidad.backend.infrastructure.adapter.controller;

import com.biodiversidad.backend.domain.model.Fauna;
import com.biodiversidad.backend.domain.port.in.FaunaService;
import com.biodiversidad.backend.infrastructure.controller.FaunaController;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FaunaControllerTest {
	
	@DisplayName("Test obtener toda la fauna")
    @Test
    void testGetAllFauna() {
		// Simular el servicio de fauna
        FaunaService faunaService = mock(FaunaService.class);
        FaunaController controller = new FaunaController(faunaService);
        List<Fauna> faunaList = Arrays.asList(new Fauna(), new Fauna());
        when(faunaService.getAllFauna()).thenReturn(faunaList);
        
        // Llamar el método del controlador
        ResponseEntity<List<Fauna>> response = controller.getAllFauna();
        assertEquals(200, response.getStatusCode().value());
        List<Fauna> body = response.getBody();
        assertNotNull(body);
		assertEquals(2, body.size());
    }
	
	@DisplayName("Test obtener fauna por ID")
    @Test
    void testGetFaunaByIdFound() {
		// Simular el servicio de fauna
        FaunaService faunaService = mock(FaunaService.class);
        FaunaController controller = new FaunaController(faunaService);
        Fauna fauna = new Fauna();
        when(faunaService.getFaunaById("1")).thenReturn(Optional.of(fauna));
        
        // Llamar el método del controlador
        ResponseEntity<Fauna> response = controller.getFaunaById("1");
        assertEquals(200, response.getStatusCode().value());
        assertEquals(fauna, response.getBody());
    }

	@DisplayName("Test obtener fauna por ID no encontrado")
    @Test
    void testGetFaunaByIdNotFound() {
		// Simular el servicio de fauna
        FaunaService faunaService = mock(FaunaService.class);
        FaunaController controller = new FaunaController(faunaService);
        when(faunaService.getFaunaById("1")).thenReturn(Optional.empty());
        
     // Llamar el método del controlador
        ResponseEntity<Fauna> response = controller.getFaunaById("1");
        assertEquals(404, response.getStatusCode().value());
    }
	
	@DisplayName("Test crear fauna")
	@Test
	void testCreateFauna() {
		// Simular el servicio de fauna
		FaunaService faunaService = mock(FaunaService.class);
		FaunaController controller = new FaunaController(faunaService);
		Fauna fauna = new Fauna();
		when(faunaService.createFauna(fauna)).thenReturn(fauna);
		
		// Llamar el método del controlador
		ResponseEntity<Fauna> response = controller.createFauna(fauna);
		assertEquals(201, response.getStatusCode().value());
		assertEquals(fauna, response.getBody());
	}
	
	@DisplayName("Test actualizar fauna")
	@Test
	void testUpdateFauna() {
		// Simular el servicio de fauna
		FaunaService faunaService = mock(FaunaService.class);
		FaunaController controller = new FaunaController(faunaService);
		Fauna fauna = new Fauna();
		when(faunaService.updateFauna("1", fauna)).thenReturn(fauna);
		
		// Llamar el método del controlador
		ResponseEntity<Fauna> response = controller.updateFauna("1", fauna);
		assertEquals(200, response.getStatusCode().value());
		assertEquals(fauna, response.getBody());
	}
	
	@DisplayName("Test actualizar fauna no encontrada")
	@Test
	void testUpdateFaunaNotFound() {
		// Simular el servicio de fauna
		FaunaService faunaService = mock(FaunaService.class);
		FaunaController controller = new FaunaController(faunaService);
		when(faunaService.updateFauna("1", new Fauna())).thenReturn(null);
		
		// Llamar el método del controlador
		ResponseEntity<Fauna> response = controller.updateFauna("1", new Fauna());
		assertEquals(404, response.getStatusCode().value());
	}
	
	@DisplayName("Test eliminar fauna")
	@Test
	void testDeleteFauna() {
		// Simular el servicio de fauna
		FaunaService faunaService = mock(FaunaService.class);
		FaunaController controller = new FaunaController(faunaService);
		doNothing().when(faunaService).deleteFauna("1");
		
		// Llamar el método del controlador
		ResponseEntity<Void> response = controller.deleteFauna("1");
		assertEquals(204, response.getStatusCode().value());
	}
}
