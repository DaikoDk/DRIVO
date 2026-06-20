package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.dto.request.ClienteMeUpdateRequest;
import com.drivo.alquilerauto.dto.request.ClienteRequest;
import com.drivo.alquilerauto.dto.response.ClienteResponse;
import com.drivo.alquilerauto.entity.Cliente;
import com.drivo.alquilerauto.entity.Licencia;
import com.drivo.alquilerauto.exception.BadRequestException;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.mapper.ClienteMapper;
import com.drivo.alquilerauto.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final LicenciaService licenciaService;
    private final ClienteMapper clienteMapper;

    @Transactional(readOnly = true)
    public List<ClienteResponse> findAllActivos() {
        return clienteMapper.toResponseList(clienteRepository.findByActivoTrue());
    }

    @Transactional(readOnly = true)
    public ClienteResponse findById(Integer id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));
        return clienteMapper.toResponse(cliente);
    }

    public ClienteResponse create(ClienteRequest request) {
        if (clienteRepository.existsByDni(request.dni())) {
            throw new BadRequestException("DNI ya registrado");
        }
        if (clienteRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email ya registrado");
        }

        Licencia licencia = new Licencia();
        licencia.setNumeroLicencia(request.licencia().numeroLicencia());
        licencia.setCategoria(request.licencia().categoria());
        licencia.setFechaVencimiento(request.licencia().fechaVencimiento());
        licencia = licenciaService.create(licencia);

        Cliente cliente = clienteMapper.toEntity(request);
        cliente.setLicencia(licencia);
        cliente.setNumeroReservas(0);
        cliente.setNumeroIncidentes(0);
        cliente.setBloqueado(false);
        cliente.setEstado("activo");
        cliente.setActivo(true);
        cliente.setFechaRegistro(LocalDateTime.now());

        return clienteMapper.toResponse(clienteRepository.save(cliente));
    }

    public ClienteResponse update(Integer id, ClienteRequest request) {
        Cliente cliente = obtenerClienteOFallar(id);

        if (!request.dni().equals(cliente.getDni()) && clienteRepository.existsByDni(request.dni())) {
            throw new BadRequestException("DNI ya registrado");
        }
        if (!request.email().equals(cliente.getEmail()) && clienteRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email ya registrado");
        }

        clienteMapper.updateEntity(request, cliente);
        return clienteMapper.toResponse(clienteRepository.save(cliente));
    }

    public ClienteResponse bloquear(Integer id) {
        Cliente cliente = obtenerClienteOFallar(id);
        cliente.setBloqueado(true);
        cliente.setEstado("inactivo");
        return clienteMapper.toResponse(clienteRepository.save(cliente));
    }

    public ClienteResponse desbloquear(Integer id) {
        Cliente cliente = obtenerClienteOFallar(id);
        cliente.setBloqueado(false);
        cliente.setEstado("activo");
        return clienteMapper.toResponse(clienteRepository.save(cliente));
    }

    public void delete(Integer id) {
        Cliente cliente = obtenerClienteOFallar(id);
        cliente.setActivo(false);
        clienteRepository.save(cliente);
    }

    @Transactional(readOnly = true)
    public ClienteResponse getAuthenticatedCliente(String correo) {
        Cliente cliente = clienteRepository.findByUsuarioCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado para el usuario"));
        return clienteMapper.toResponse(cliente);
    }

    public ClienteResponse updateMe(String correo, ClienteMeUpdateRequest request) {
        Cliente cliente = clienteRepository.findByUsuarioCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado para el usuario"));
        if (request.nombre() != null) {
            cliente.setNombre(request.nombre());
        }
        if (request.apellidoPaterno() != null) {
            cliente.setApellidoPaterno(request.apellidoPaterno());
        }
        if (request.apellidoMaterno() != null) {
            cliente.setApellidoMaterno(request.apellidoMaterno());
        }
        if (request.telefono() != null) {
            cliente.setTelefono(request.telefono());
        }
        if (request.direccion() != null) {
            cliente.setDireccion(request.direccion());
        }
        if (request.numeroLicencia() != null) {
            Licencia licencia = cliente.getLicencia();
            if (licencia == null) {
                licencia = new Licencia();
                licencia.setNumeroLicencia(request.numeroLicencia());
                licencia.setCategoria(request.categoriaLicencia());
                licencia.setFechaVencimiento(request.fechaVencimientoLicencia());
                licencia = licenciaService.create(licencia);
                cliente.setLicencia(licencia);
            } else {
                licencia.setNumeroLicencia(request.numeroLicencia());
                if (request.categoriaLicencia() != null) licencia.setCategoria(request.categoriaLicencia());
                if (request.fechaVencimientoLicencia() != null) licencia.setFechaVencimiento(request.fechaVencimientoLicencia());
            }
        }
        return clienteMapper.toResponse(clienteRepository.save(cliente));
    }

    private Cliente obtenerClienteOFallar(Integer id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));
    }
}
