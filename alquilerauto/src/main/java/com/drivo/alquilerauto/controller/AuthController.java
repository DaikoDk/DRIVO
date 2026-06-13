package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.ApiResponse;
import com.drivo.alquilerauto.dto.request.LoginRequest;
import com.drivo.alquilerauto.dto.request.RegisterRequest;
import com.drivo.alquilerauto.dto.response.AuthResponse;
import com.drivo.alquilerauto.dto.response.RegisterResponse;
import com.drivo.alquilerauto.entity.Cliente;
import com.drivo.alquilerauto.entity.Licencia;
import com.drivo.alquilerauto.entity.Usuario;
import com.drivo.alquilerauto.exception.BadRequestException;
import com.drivo.alquilerauto.repository.ClienteRepository;
import com.drivo.alquilerauto.repository.LicenciaRepository;
import com.drivo.alquilerauto.repository.UsuarioRepository;
import com.drivo.alquilerauto.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final LicenciaRepository licenciaRepository;
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
    @Transactional
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        if (usuarioRepository.existsByCorreo(request.email())) {
            throw new BadRequestException("Email ya registrado");
        }
        if (clienteRepository.existsByDni(request.dni())) {
            throw new BadRequestException("DNI ya registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.nombre());
        usuario.setCorreo(request.email());
        usuario.setClave(passwordEncoder.encode(request.clave()));
        usuario.setRol("CLIENTE");
        usuario.setActivo(true);
        usuario.setFechaRegistro(LocalDateTime.now());
        usuario = usuarioRepository.save(usuario);

        Licencia licencia = null;
        if (request.licencia() != null) {
            licencia = new Licencia();
            licencia.setNumeroLicencia(request.licencia().numeroLicencia());
            licencia.setCategoria(request.licencia().categoria());
            licencia.setFechaVencimiento(request.licencia().fechaVencimiento());
            licencia = licenciaRepository.save(licencia);
        }

        Cliente cliente = new Cliente();
        cliente.setUsuario(usuario);
        cliente.setNombre(request.nombre());
        cliente.setApellidoPaterno(request.apellidoPaterno());
        cliente.setApellidoMaterno(request.apellidoMaterno());
        cliente.setDni(request.dni());
        cliente.setTelefono(request.telefono());
        cliente.setEmail(request.email());
        cliente.setDireccion(request.direccion());
        cliente.setLicencia(licencia);
        cliente.setNumeroReservas(0);
        cliente.setNumeroIncidentes(0);
        cliente.setBloqueado(false);
        cliente.setEstado("activo");
        cliente.setActivo(true);
        cliente.setFechaRegistro(LocalDateTime.now());
        clienteRepository.save(cliente);

        String token = jwtTokenProvider.generateToken(usuario.getCorreo(), "CLIENTE");

        RegisterResponse response = new RegisterResponse(token, usuario.getNombre(), "CLIENTE");
        return ResponseEntity.ok(ApiResponse.ok(response, "Registro exitoso"));
    }
}
