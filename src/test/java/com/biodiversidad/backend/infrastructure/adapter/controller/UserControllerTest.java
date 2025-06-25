package com.biodiversidad.backend.infrastructure.adapter.controller;

import com.biodiversidad.backend.domain.model.User;
import com.biodiversidad.backend.domain.port.in.UserService;
import com.biodiversidad.backend.infrastructure.controller.UserController;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserControllerTest {
    @Test
    void testGetAllUsers() {
        UserService userService = mock(UserService.class);
        UserController controller = new UserController(userService);
        List<User> userList = Arrays.asList(new User(), new User());
        when(userService.getAllUsers()).thenReturn(userList);
        ResponseEntity<List<User>> response = controller.getAllUsers();
        assertEquals(200, response.getStatusCode().value());
        assertEquals(2, response.getBody().size());
    }

    @Test
    void testGetUserByIdFound() {
        UserService userService = mock(UserService.class);
        UserController controller = new UserController(userService);
        User user = new User();
        when(userService.getUserById("1")).thenReturn(Optional.of(user));
        ResponseEntity<User> response = controller.getUserById("1");
        assertEquals(200, response.getStatusCode().value());
        assertEquals(user, response.getBody());
    }

    @Test
    void testGetUserByIdNotFound() {
        UserService userService = mock(UserService.class);
        UserController controller = new UserController(userService);
        when(userService.getUserById("1")).thenReturn(Optional.empty());
        ResponseEntity<User> response = controller.getUserById("1");
        assertEquals(404, response.getStatusCode().value());
    }
}
