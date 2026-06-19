package com.drivo.alquilerauto;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AlquilerautoApplication {

	public static void main(String[] args) {
		SpringApplication.run(AlquilerautoApplication.class, args);
	}

}
