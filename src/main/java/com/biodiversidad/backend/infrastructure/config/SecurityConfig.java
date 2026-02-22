package com.biodiversidad.backend.infrastructure.config;
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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public InMemoryUserDetailsManager usersManager(PasswordEncoder passwordEncoder) {
        List<UserDetails> users = List.of(
            User.builder()
                .username("Administrador")
                .password(passwordEncoder.encode("Administrador"))
                .roles("Admin")
                .build(),

            User.builder()
                .username("Cliente")
                .password(passwordEncoder.encode("Cliente"))
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