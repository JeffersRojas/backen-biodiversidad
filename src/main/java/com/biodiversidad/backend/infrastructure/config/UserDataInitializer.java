package com.biodiversidad.backend.infrastructure.config;

import com.biodiversidad.backend.domain.model.User;
import com.biodiversidad.backend.domain.port.out.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class UserDataInitializer {

    @Bean
    public CommandLineRunner initDefaultUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            for (User u : userRepository.findAll()) {
                String pwd = u.getPassword();
                if (pwd != null && !pwd.isBlank() && !pwd.startsWith("$2a$") && !pwd.startsWith("$2b$") && !pwd.startsWith("$2y$")) {
                    u.setPassword(passwordEncoder.encode(pwd));
                    userRepository.save(u);
                }
            }

            userRepository.findByUsername("Administrador").orElseGet(() -> {
                User admin = new User();
                admin.setEmail("admin@biodiversidad.com");
                admin.setUsername("Administrador");
                admin.setPassword(passwordEncoder.encode("Administrador"));
                admin.setRoleId("Admin");
                return userRepository.save(admin);
            });

            userRepository.findByUsername("Cliente").orElseGet(() -> {
                User client = new User();
                client.setEmail("cliente@biodiversidad.com");
                client.setUsername("Cliente");
                client.setPassword(passwordEncoder.encode("Cliente"));
                client.setRoleId("Client");
                return userRepository.save(client);
            });
        };
    }
}
