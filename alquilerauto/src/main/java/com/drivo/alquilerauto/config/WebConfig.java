package com.drivo.alquilerauto.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.fotos.directorio:uploads/fotos}")
    private String directorioFotos;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadDir = Paths.get(directorioFotos).toAbsolutePath();
        registry.addResourceHandler("/uploads/fotos/**")
                .addResourceLocations("file:" + uploadDir.toString() + "/");
    }
}
