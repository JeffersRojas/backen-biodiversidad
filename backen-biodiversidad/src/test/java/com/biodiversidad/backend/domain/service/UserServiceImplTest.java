package com.biodiversidad.backend.domain.service;

import com.biodiversidad.backend.domain.model.User;
import com.biodiversidad.backend.domain.port.out.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserServiceImplTest {

    @Test
    void getAllUsers_devuelveListaUsuarios() {
        UserRepository userRepository = Mockito.mock(UserRepository.class);
        PasswordEncoder passwordEncoder = Mockito.mock(PasswordEncoder.class);
        UserServiceImpl userService = new UserServiceImpl(userRepository, passwordEncoder);

        List<User> usuarios = List.of(
                new User("1", "a@correo.com", "user1", "pwd", "Admin"),
                new User("2", "b@correo.com", "user2", "pwd", "Client")
        );

        when(userRepository.findAll()).thenReturn(usuarios);

        List<User> resultado = userService.getAllUsers();

        assertEquals(2, resultado.size());
        assertEquals("a@correo.com", resultado.get(0).getEmail());
        verify(userRepository).findAll();
    }

    @Test
    void getUserByEmail_devuelveUsuarioCuandoExiste() {
        UserRepository userRepository = Mockito.mock(UserRepository.class);
        PasswordEncoder passwordEncoder = Mockito.mock(PasswordEncoder.class);
        UserServiceImpl userService = new UserServiceImpl(userRepository, passwordEncoder);

        String email = "test@correo.com";
        User user = new User("1", email, "usuario", "pwd", "Admin");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        Optional<User> resultado = userService.getUserByEmail(email);

        assertTrue(resultado.isPresent());
        assertEquals(email, resultado.get().getEmail());
        verify(userRepository).findByEmail(email);
    }

    @Test
    void updateUser_actualizaCamposBasicosCuandoExiste() {
        UserRepository userRepository = Mockito.mock(UserRepository.class);
        PasswordEncoder passwordEncoder = Mockito.mock(PasswordEncoder.class);
        UserServiceImpl userService = new UserServiceImpl(userRepository, passwordEncoder);

        User existente = new User("1", "old@correo.com", "oldUser", "pwd", "Client");
        User actualizado = new User(null, "new@correo.com", "newUser", "pwd", "Admin");

        when(userRepository.findById("1")).thenReturn(Optional.of(existente));
        when(userRepository.save(existente)).thenReturn(existente);

        User resultado = userService.updateUser("1", actualizado);

        assertEquals("new@correo.com", resultado.getEmail());
        assertEquals("newUser", resultado.getUsername());
        assertEquals("Admin", resultado.getRoleId());
        verify(userRepository).findById("1");
        verify(userRepository).save(existente);
    }

    @Test
    void deleteUser_invocaDeleteEnRepositorio() {
        UserRepository userRepository = Mockito.mock(UserRepository.class);
        PasswordEncoder passwordEncoder = Mockito.mock(PasswordEncoder.class);
        UserServiceImpl userService = new UserServiceImpl(userRepository, passwordEncoder);

        userService.deleteUser("1");

        verify(userRepository).deleteById("1");
    }
}
