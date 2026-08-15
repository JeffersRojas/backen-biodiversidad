package com.biodiversidad.backend.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "flora")
public class Flora {
    @Id
    private String id;
    private String nombreComun;
    private String nombreCientifico;
    private String familia;
    private String tipo;
    private String estadoConservacion;
    private String habitat;
    private String ubicacionGeografica;
}
