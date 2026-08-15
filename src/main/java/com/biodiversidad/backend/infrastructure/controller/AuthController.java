package com.biodiversidad.backend.infrastructure.controller;

import com.biodiversidad.backend.domain.model.User;
import com.biodiversidad.backend.domain.port.out.UserRepository;
import com.biodiversidad.backend.infrastructure.dto.AuthRequest;
import com.biodiversidad.backend.infrastructure.dto.AuthResponse;
import com.biodiversidad.backend.infrastructure.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          UserDetailsService userDetailsService,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new java.util.HashMap<String, String>() {{
                        put("error", "Credenciales inválidas");
                    }});
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String role = userDetails.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .findFirst().orElse("Client");

        final String jwt = jwtUtil.generateToken(userDetails, role);

        User user = userRepository.findByUsername(request.getUsername()).orElse(null);

        AuthResponse response = new AuthResponse();
        response.setToken(jwt);
        response.setUsername(request.getUsername());
        response.setRole(role);
        if (user != null) {
            response.setEmail(user.getEmail());
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(new java.util.HashMap<String, String>() {{
                        put("error", "El nombre de usuario ya existe");
                    }});
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRoleId() == null || user.getRoleId().isBlank()) {
            user.setRoleId("Client");
        }

        User saved = userRepository.save(user);
        saved.setPassword(null);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
