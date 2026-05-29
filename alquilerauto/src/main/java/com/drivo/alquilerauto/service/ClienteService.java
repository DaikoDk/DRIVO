package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.entity.Cliente;
import com.drivo.alquilerauto.exception.BadRequestException;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Transactional(readOnly = true)
    public List<Cliente> findAll() {
        return clienteRepository.findByActivoTrue();
    }

    @Transactional(readOnly = true)
    public Cliente findById(Integer id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Cliente> findActivos() {
        return clienteRepository.findByActivoTrueAndEstado("activo");
    }

    public Cliente create(Cliente cliente) {
        if (clienteRepository.existsByDni(cliente.getDni())) {
            throw new BadRequestException("Ya existe un cliente con el DNI: " + cliente.getDni());
        }
        if (clienteRepository.existsByEmail(cliente.getEmail())) {
            throw new BadRequestException("Ya existe un cliente con el email: " + cliente.getEmail());
        }
        return clienteRepository.save(cliente);
    }

    public Cliente update(Integer id, Cliente datos) {
        Cliente cliente = findById(id);
        cliente.setNombre(datos.getNombre());
        cliente.setApellidoPaterno(datos.getApellidoPaterno());
        cliente.setApellidoMaterno(datos.getApellidoMaterno());
        cliente.setTelefono(datos.getTelefono());
        cliente.setEmail(datos.getEmail());
        cliente.setDireccion(datos.getDireccion());
        if (datos.getLicencia() != null) cliente.setLicencia(datos.getLicencia());
        return clienteRepository.save(cliente);
    }

    public Cliente toggleBloqueo(Integer id) {
        Cliente cliente = findById(id);
        cliente.setBloqueado(!cliente.getBloqueado());
        if (cliente.getBloqueado()) {
            cliente.setEstado("inactivo");
        } else {
            cliente.setEstado("activo");
        }
        return clienteRepository.save(cliente);
    }

    public void delete(Integer id) {
        Cliente cliente = findById(id);
        cliente.setActivo(false);
        clienteRepository.save(cliente);
    }
}
