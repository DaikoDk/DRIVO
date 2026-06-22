package com.drivo.alquilerauto.service;

import com.drivo.alquilerauto.entity.Auto;
import com.drivo.alquilerauto.exception.BadRequestException;
import com.drivo.alquilerauto.repository.AutoRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FotoService {

    private final AutoRepository autoRepository;

    @Value("${app.fotos.directorio:uploads/fotos}")
    private String directorioFotos;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final String[] FORMATOS_PERMITIDOS = {"image/jpeg", "image/png", "image/webp"};

    @PostConstruct
    public void init() {
        try {
            ImageIO.scanForPlugins();
            Path dir = Paths.get(directorioFotos);
            if (Files.exists(dir)) return;
            Files.createDirectories(dir);

            BufferedImage img = new BufferedImage(800, 600, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = img.createGraphics();
            g.setColor(new Color(220, 220, 220));
            g.fillRect(0, 0, 800, 600);
            g.setColor(new Color(120, 120, 120));
            g.setFont(new Font("Arial", Font.BOLD, 56));
            FontMetrics fm = g.getFontMetrics();
            String text = "DRIVO";
            int x = (800 - fm.stringWidth(text)) / 2;
            int y = (600 - fm.getHeight()) / 2 + fm.getAscent();
            g.drawString(text, x, y);
            g.setFont(new Font("Arial", Font.PLAIN, 24));
            fm = g.getFontMetrics();
            text = "Rent-a-Car";
            x = (800 - fm.stringWidth(text)) / 2;
            g.drawString(text, x, y + 50);
            g.dispose();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(img, "webp", baos);
            Files.write(dir.resolve("default.webp"), baos.toByteArray());
            log.info("Directorio de fotos creado en: {}", dir.toAbsolutePath());

            List<Auto> sinFoto = autoRepository.findAll().stream()
                    .filter(a -> a.getFotoUrl() == null).toList();
            if (!sinFoto.isEmpty()) {
                sinFoto.forEach(a -> a.setFotoUrl("/uploads/fotos/default.webp"));
                autoRepository.saveAll(sinFoto);
                log.info("Asignada foto default a {} auto(s)", sinFoto.size());
            }
        } catch (Exception e) {
            log.warn("No se pudo inicializar el directorio de fotos: {}", e.getMessage());
        }
    }

    @Transactional
    public String guardarArchivo(Integer idAuto, MultipartFile archivo) {
        validarArchivo(archivo);
        return convertirYGuardar(idAuto, archivo);
    }

    @Transactional
    public String guardarDesdeUrl(Integer idAuto, String url) {
        byte[] bytes = descargar(url);
        try {
            if (url.toLowerCase().endsWith(".webp")) {
                return guardarDirecto(idAuto, bytes);
            }
            return convertirYGuardar(idAuto, bytes, url);
        } catch (IOException e) {
            throw new BadRequestException("Error al procesar la imagen desde URL: " + url);
        }
    }

    private byte[] descargar(String url) {
        try {
            HttpURLConnection conn = (HttpURLConnection) URI.create(url).toURL().openConnection();
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(15000);
            conn.connect();
            int code = conn.getResponseCode();
            if (code != 200) {
                throw new BadRequestException("El servidor respondio con codigo " + code + " para: " + url);
            }
            byte[] bytes;
            try (InputStream in = conn.getInputStream()) {
                bytes = in.readAllBytes();
            }
            if (bytes.length > MAX_FILE_SIZE) {
                throw new BadRequestException("La imagen supera los 5MB");
            }
            return bytes;
        } catch (IOException e) {
            throw new BadRequestException("No se pudo descargar la imagen desde la URL: " + url);
        }
    }

    private String guardarDirecto(Integer idAuto, byte[] bytes) throws IOException {
        Path dir = Paths.get(directorioFotos);
        Files.createDirectories(dir);
        Path archivo = dir.resolve(idAuto + ".webp");
        Files.write(archivo, bytes);
        return actualizarAuto(idAuto);
    }

    private String actualizarAuto(Integer idAuto) {
        String fotoUrl = getFotoUrl(idAuto);
        Auto auto = autoRepository.findById(idAuto)
                .orElseThrow(() -> new RuntimeException("Auto no encontrado con id: " + idAuto));
        auto.setFotoUrl(fotoUrl);
        autoRepository.save(auto);
        return fotoUrl;
    }

    public String getFotoUrl(Integer idAuto) {
        return "/uploads/fotos/" + idAuto + ".webp";
    }

    private void validarArchivo(MultipartFile archivo) {
        if (archivo.isEmpty()) {
            throw new BadRequestException("El archivo está vacío");
        }
        if (archivo.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("La imagen supera los 5MB");
        }
        String contentType = archivo.getContentType();
        boolean valido = false;
        for (String fmt : FORMATOS_PERMITIDOS) {
            if (fmt.equals(contentType)) {
                valido = true;
                break;
            }
        }
        if (!valido) {
            throw new BadRequestException("Formato no permitido. Use JPG, PNG o WebP");
        }
    }

    private String convertirYGuardar(Integer idAuto, MultipartFile archivo) {
        try {
            BufferedImage imagen = ImageIO.read(archivo.getInputStream());
            return escribirWebp(idAuto, imagen);
        } catch (IOException e) {
            throw new BadRequestException("Error al procesar la imagen");
        }
    }

    private String convertirYGuardar(Integer idAuto, byte[] bytes, String urlOrigen) {
        try {
            BufferedImage imagen = ImageIO.read(new ByteArrayInputStream(bytes));
            return escribirWebp(idAuto, imagen);
        } catch (IOException e) {
            throw new BadRequestException("Error al procesar la imagen desde URL");
        }
    }

    private String escribirWebp(Integer idAuto, BufferedImage imagen) throws IOException {
        Path dir = Paths.get(directorioFotos);
        Files.createDirectories(dir);
        Path archivoWebp = dir.resolve(idAuto + ".webp");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(imagen, "webp", baos);
        Files.write(archivoWebp, baos.toByteArray());

        return actualizarAuto(idAuto);
    }
}
