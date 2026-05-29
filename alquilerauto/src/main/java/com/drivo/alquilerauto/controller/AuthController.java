package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.request.LoginRequest;
import com.drivo.alquilerauto.dto.response.AuthResponse;
import com.drivo.alquilerauto.entity.Usuario;
import com.drivo.alquilerauto.repository.UsuarioRepository;
import com.drivo.alquilerauto.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.correo(), request.clave()));

        Usuario usuario = usuarioRepository.findByCorreo(request.correo())
                .orElseThrow();

        String token = jwtTokenProvider.generateToken(usuario.getCorreo(), usuario.getRol());

        return ResponseEntity.ok(new AuthResponse(token, usuario.getNombre(),
                usuario.getCorreo(), usuario.getRol()));
    }

    @PostMapping("/register")
    public ResponseEntity<Usuario> register(@RequestBody Usuario usuario) {
        usuario.setClave(passwordEncoder.encode(usuario.getClave()));
        return ResponseEntity.ok(usuarioRepository.save(usuario));
    }
}
