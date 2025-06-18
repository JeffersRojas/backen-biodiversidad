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

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}

