package com.biodiversidad.backend.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.Customizer;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public InMemoryUserDetailsManager usersManager() {
        List<UserDetails> users = List.of(
            User.withDefaultPasswordEncoder()
                .username("Administrador")
                .password("Administrador")
                .roles("Admin")
                .build(),

            User.withDefaultPasswordEncoder()
                .username("Cliente")
                .password("Cliente")
                .roles("Client")
                .build()
        );

        return new InMemoryUserDetailsManager(users);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Endpoints de usuarios
                .requestMatchers(HttpMethod.POST, "/api/users").hasRole("Admin")
                .requestMatchers(HttpMethod.PUT, "/api/users/**").hasRole("Admin")
                .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("Admin")
                .requestMatchers(HttpMethod.GET, "/api/users/**").hasAnyRole("Admin", "Client")

                // Endpoints de fauna
                .requestMatchers(HttpMethod.POST, "/api/fauna").hasRole("Admin")
                .requestMatchers(HttpMethod.PUT, "/api/fauna/**").hasRole("Admin")
                .requestMatchers(HttpMethod.DELETE, "/api/fauna/**").hasRole("Admin")
                .requestMatchers(HttpMethod.GET, "/api/fauna/**").hasAnyRole("Admin", "Client")

                // Otros (por ahora, acceso libre)
                .anyRequest().permitAll()
            )
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
