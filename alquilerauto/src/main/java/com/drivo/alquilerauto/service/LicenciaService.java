package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.entity.Licencia;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.repository.LicenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LicenciaService {

    private final LicenciaRepository licenciaRepository;

    @Transactional(readOnly = true)
    public List<Licencia> findAll() {
        return licenciaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Licencia findById(Integer id) {
        return licenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Licencia no encontrada"));
    }

    public Licencia create(Licencia licencia) {
        return licenciaRepository.save(licencia);
    }

    public Licencia update(Integer id, Licencia datos) {
        Licencia licencia = findById(id);
        licencia.setNumeroLicencia(datos.getNumeroLicencia());
        licencia.setCategoria(datos.getCategoria());
        licencia.setFechaVencimiento(datos.getFechaVencimiento());
        return licenciaRepository.save(licencia);
    }

    public void delete(Integer id) {
        licenciaRepository.deleteById(id);
    }
}
