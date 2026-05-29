package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.entity.Auto;
import com.drivo.alquilerauto.exception.BadRequestException;
import com.drivo.alquilerauto.exception.ResourceNotFoundException;
import com.drivo.alquilerauto.repository.AutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AutoService {

    private final AutoRepository autoRepository;

    @Transactional(readOnly = true)
    public List<Auto> findAll() {
        return autoRepository.findByActivoTrue();
    }

    @Transactional(readOnly = true)
    public Auto findById(Integer id) {
        return autoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auto no encontrado con id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Auto> findDisponibles() {
        return autoRepository.findByActivoTrueAndEstado("Disponible");
    }

    @Transactional(readOnly = true)
    public List<Auto> findDisponiblesEnRango(LocalDate inicio, LocalDate fin) {
        return autoRepository.findDisponiblesEnRango(inicio, fin);
    }

    @Transactional(readOnly = true)
    public List<Auto> findByEstado(String estado) {
        return autoRepository.findByActivoTrueAndEstado(estado);
    }

    public Auto create(Auto auto) {
        if (autoRepository.existsByPlaca(auto.getPlaca())) {
            throw new BadRequestException("Ya existe un auto con la placa: " + auto.getPlaca());
        }
        auto.setEstado("Disponible");
        return autoRepository.save(auto);
    }

    public Auto update(Integer id, Auto datos) {
        Auto auto = findById(id);
        auto.setPlaca(datos.getPlaca());
        auto.setAnio(datos.getAnio());
        auto.setColor(datos.getColor());
        auto.setNumeroMotor(datos.getNumeroMotor());
        auto.setNumeroChasis(datos.getNumeroChasis());
        auto.setKilometrajeActual(datos.getKilometrajeActual());
        auto.setPrecioPorDia(datos.getPrecioPorDia());
        auto.setPrecioPorHora(datos.getPrecioPorHora());
        auto.setMoraPorDia(datos.getMoraPorDia());
        if (datos.getMarca() != null) auto.setMarca(datos.getMarca());
        if (datos.getModelo() != null) auto.setModelo(datos.getModelo());
        return autoRepository.save(auto);
    }

    public Auto updateEstado(Integer id, String estado) {
        Auto auto = findById(id);
        auto.setEstado(estado);
        return autoRepository.save(auto);
    }

    public void delete(Integer id) {
        Auto auto = findById(id);
        auto.setActivo(false);
        autoRepository.save(auto);
    }
}
