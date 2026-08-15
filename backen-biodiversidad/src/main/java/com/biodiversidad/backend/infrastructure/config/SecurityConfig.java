package com.biodiversidad.backend.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.Customizer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults()) // Habilitar CORS
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

                // Endpoints de flora
                .requestMatchers(HttpMethod.POST, "/api/flora").hasRole("Admin")
                .requestMatchers(HttpMethod.PUT, "/api/flora/**").hasRole("Admin")
                .requestMatchers(HttpMethod.DELETE, "/api/flora/**").hasRole("Admin")
                .requestMatchers(HttpMethod.GET, "/api/flora/**").hasAnyRole("Admin", "Client")

                // Otros (por ahora, acceso libre)
                .anyRequest().permitAll()
            )
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*")); // Permitir cualquier origen (para desarrollo)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
