package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.request.CambiarClaveRequest;
import com.drivo.alquilerauto.entity.Usuario;
import com.drivo.alquilerauto.exception.BadRequestException;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public void cambiarClave(CambiarClaveRequest request, String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.claveActual(), usuario.getClave())) {
            throw new BadRequestException("Clave actual incorrecta");
        }

        usuario.setClave(passwordEncoder.encode(request.claveNueva()));
        usuarioRepository.save(usuario);
    }
}
