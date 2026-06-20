package com.drivo.alquilerauto.controller;

import com.drivo.alquilerauto.dto.ApiResponse;
import com.drivo.alquilerauto.dto.request.AutoRequest;
import com.drivo.alquilerauto.dto.request.HoldRequest;
import com.drivo.alquilerauto.dto.response.AutoResponse;
import com.drivo.alquilerauto.dto.response.HoldResponse;
import com.drivo.alquilerauto.service.AutoService;
import com.drivo.alquilerauto.service.FotoService;
import com.drivo.alquilerauto.service.HoldService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/autos")
@RequiredArgsConstructor
public class AutoController {

    private final AutoService autoService;
    private final HoldService holdService;
    private final FotoService fotoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AutoResponse>>> findAllActivos() {
        List<AutoResponse> autos = autoService.findAllActivos();
        return ResponseEntity.ok(ApiResponse.ok(autos, "Autos activos obtenidos"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AutoResponse>> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(autoService.findById(id), "Auto encontrado"));
    }

    @GetMapping("/disponibles")
    public ResponseEntity<ApiResponse<List<AutoResponse>>> findDisponibles() {
        return ResponseEntity.ok(ApiResponse.ok(autoService.findDisponibles(), "Autos disponibles obtenidos"));
    }

    @GetMapping("/disponibles-rango")
    public ResponseEntity<ApiResponse<List<AutoResponse>>> findDisponiblesEnRango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        return ResponseEntity.ok(
                ApiResponse.ok(autoService.findDisponiblesEnRango(fechaInicio, fechaFin),
                        "Autos disponibles en el rango obtenidos"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AutoResponse>> create(@Valid @RequestBody AutoRequest request) {
        AutoResponse creado = autoService.create(request);
        return ResponseEntity.ok(ApiResponse.ok(creado, "Auto creado exitosamente"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AutoResponse>> update(
            @PathVariable Integer id,
            @Valid @RequestBody AutoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(autoService.update(id, request), "Auto actualizado exitosamente"));
    }

    @PostMapping("/{id}/hold")
    public ResponseEntity<ApiResponse<HoldResponse>> hold(
            @PathVariable Integer id,
            @Valid @RequestBody HoldRequest request) {
        HoldResponse hold = holdService.hold(id);
        return ResponseEntity.ok(ApiResponse.ok(hold, "Auto reservado temporalmente"));
    }

    @PostMapping("/{id}/hold/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelHold(@PathVariable Integer id) {
        holdService.cancel(id);
        return ResponseEntity.ok(ApiResponse.ok("Hold liberado"));
    }

    @PostMapping(value = "/{id}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> subirFoto(
            @PathVariable Integer id,
            @RequestParam("archivo") MultipartFile archivo) {
        String fotoUrl = fotoService.guardarArchivo(id, archivo);
        return ResponseEntity.ok(ApiResponse.ok(fotoUrl, "Foto subida exitosamente"));
    }

    @PutMapping("/{id}/foto-url")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> definirFotoUrl(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String url = body.get("url");
        if (url == null || url.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("La URL es obligatoria"));
        }
        String fotoUrl = fotoService.guardarDesdeUrl(id, url);
        return ResponseEntity.ok(ApiResponse.ok(fotoUrl, "URL de foto actualizada exitosamente"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        autoService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Auto desactivado exitosamente"));
    }
}
