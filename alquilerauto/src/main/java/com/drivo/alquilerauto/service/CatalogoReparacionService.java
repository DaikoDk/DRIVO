package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.entity.CatalogoReparacion;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.repository.CatalogoReparacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CatalogoReparacionService {

    private final CatalogoReparacionRepository repository;

    @Transactional(readOnly = true)
    public List<CatalogoReparacion> findAll() {
        return repository.findByActivoTrue();
    }

    @Transactional(readOnly = true)
    public CatalogoReparacion findById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catálogo de reparación no encontrado"));
    }

    public CatalogoReparacion create(CatalogoReparacion catalogo) {
        return repository.save(catalogo);
    }

    public CatalogoReparacion update(Integer id, CatalogoReparacion datos) {
        CatalogoReparacion catalogo = findById(id);
        catalogo.setDescripcion(datos.getDescripcion());
        catalogo.setCostoEstimado(datos.getCostoEstimado());
        catalogo.setTiempoEstimadoHoras(datos.getTiempoEstimadoHoras());
        return repository.save(catalogo);
    }

    public void delete(Integer id) {
        CatalogoReparacion catalogo = findById(id);
        catalogo.setActivo(false);
        repository.save(catalogo);
    }
}
