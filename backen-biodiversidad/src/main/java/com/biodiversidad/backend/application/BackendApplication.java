package com.biodiversidad.backend.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {
    "com.biodiversidad.backend.infrastructure",
    "com.biodiversidad.backend.domain"
})
@EnableMongoRepositories(basePackages = "com.biodiversidad.backend.infrastructure.adapter.repository")
public class BackendApplication {

    // Constructor protegido para ocultar el público implícito (Fix SonarCloud java:S1118) pero permitir proxy CGLIB
    protected BackendApplication() {
    }

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}

