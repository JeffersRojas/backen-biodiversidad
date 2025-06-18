package com.biodiversidad.backend.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Clase de modelo que representa un usuario del sistema.
 * @Data: Anotación de Lombok para generar getters, setters, toString, equals y hashCode automáticamente.
 * @AllArgsConstructor: Anotación de Lombok para generar un constructor con todos los argumentos.
 * @NoArgsConstructor: Anotación de Lombok para generar un constructor sin argumentos.
 * @Document: Anotación de Spring Data para mapear esta clase a una colección de MongoDB.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String email;
    private String username;
    private String password; 
    private String roleId; 
}