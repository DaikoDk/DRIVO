package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.entity.HistorialKilometraje;
import com.drivo.alquilerauto.repository.HistorialKilometrajeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class HistorialKilometrajeService {

    private final HistorialKilometrajeRepository repository;

    @Transactional(readOnly = true)
    public List<HistorialKilometraje> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<HistorialKilometraje> findByAuto(Integer idAuto) {
        return repository.findByAutoIdAutoOrderByFechaRegistroDesc(idAuto);
    }
}
