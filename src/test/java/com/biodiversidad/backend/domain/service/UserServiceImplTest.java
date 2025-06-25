package com.biodiversidad.backend.domain.service;

import com.biodiversidad.backend.domain.model.User;
import com.biodiversidad.backend.domain.port.out.UserRepository;
import org.junit.jupiter.api.Test;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceImplTest {
    @Test
    void testGetAllUsers() {
        UserRepository userRepository = mock(UserRepository.class);
        UserServiceImpl service = new UserServiceImpl(userRepository);
        List<User> userList = Arrays.asList(new User(), new User());
        when(userRepository.findAll()).thenReturn(userList);
        List<User> result = service.getAllUsers();
        assertEquals(2, result.size());
    }

    @Test
    void testGetUserByIdFound() {
        UserRepository userRepository = mock(UserRepository.class);
        UserServiceImpl service = new UserServiceImpl(userRepository);
        User user = new User();
        when(userRepository.findById("1")).thenReturn(Optional.of(user));
        Optional<User> result = service.getUserById("1");
        assertTrue(result.isPresent());
        assertEquals(user, result.get());
    }

    @Test
    void testGetUserByIdNotFound() {
        UserRepository userRepository = mock(UserRepository.class);
        UserServiceImpl service = new UserServiceImpl(userRepository);
        when(userRepository.findById("1")).thenReturn(Optional.empty());
        Optional<User> result = service.getUserById("1");
        assertFalse(result.isPresent());
    }
}
