package com.biodiversidad.backend.domain.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;

class FaunaTest {

	@DisplayName("Test de la clase Fauna")
    @Test
    void testSetters() {
        Fauna fauna = new Fauna();
        fauna.setId("1");
        fauna.setNombreComun("Jaguar");
        fauna.setNombreCientifico("Panthera onca");
        fauna.setFamilia("Felidae");
        fauna.setPeligroExtincion("En peligro");
        fauna.setHabitat("Selva");
        fauna.setUbicacionGeografica("Amazonas");

        assertEquals("1", fauna.getId());
        assertEquals("Jaguar", fauna.getNombreComun());
        assertEquals("Panthera onca", fauna.getNombreCientifico());
        assertEquals("Felidae", fauna.getFamilia());
        assertEquals("En peligro", fauna.getPeligroExtincion());
        assertEquals("Selva", fauna.getHabitat());
        assertEquals("Amazonas", fauna.getUbicacionGeografica());
    }

	@DisplayName("Test del constructor de la clase Fauna")
    @Test
    void testAllArgsConstructor() {
        Fauna fauna = new Fauna(
            "2",
            "Oso de anteojos",
            "Tremarctos ornatus",
            "Ursidae",
            "Vulnerable",
            "Bosque andino",
            "Cordillera de los Andes"
        );

        assertEquals("2", fauna.getId());
        assertEquals("Oso de anteojos", fauna.getNombreComun());
        assertEquals("Tremarctos ornatus", fauna.getNombreCientifico());
        assertEquals("Ursidae", fauna.getFamilia());
        assertEquals("Vulnerable", fauna.getPeligroExtincion());
        assertEquals("Bosque andino", fauna.getHabitat());
        assertEquals("Cordillera de los Andes", fauna.getUbicacionGeografica());
    }

	@DisplayName("Test de la clase Fauna usando ToString")
    @Test
    void testToString() {
        Fauna fauna = new Fauna("4", "Mono aullador", "Alouatta seniculus", "Atelidae", "Preocupación menor", "Bosque", "Amazonas");
        String toString = fauna.toString();
        assertTrue(toString.contains("Mono aullador"));
        assertTrue(toString.contains("Alouatta seniculus"));
    }
}
