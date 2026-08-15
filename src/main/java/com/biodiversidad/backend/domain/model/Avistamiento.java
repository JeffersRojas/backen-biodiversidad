package com.biodiversidad.backend.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "avistamientos")
public class Avistamiento {
    @Id
    private String id;

    private String idLocal;

    private String usuarioId;
    private String usuarioNombre;

    private String categoria;

    private String reino;
    private String filo;
    private String clase;
    private String nombreComun;
    private String nombreCientifico;
    private String familia;

    private Integer cantidadIndividuos;
    private String notasObservacion;

    private Double latitud;
    private Double longitud;
    private Double precisionGpsMetros;

    private List<String> fotosBase64;

    private Instant fechaHoraRegistro;
    private Instant fechaHoraSincronizacion;

    private String estadoSincronizacion;
    private Integer intentosSincronizacion;
    private String errorSincronizacion;
}
