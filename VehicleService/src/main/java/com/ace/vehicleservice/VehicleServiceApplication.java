package com.ace.vehicleservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@SpringBootApplication
public class VehicleServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(VehicleServiceApplication.class, args);
	}

	@Bean
	public CorsWebFilter corsFilter() {
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

		CorsConfiguration config = new CorsConfiguration();
		config.addAllowedOrigin("http://localhost:3000"); // Allow only your frontend origin
		config.addAllowedMethod("*"); // Allow all HTTP methods
		config.addAllowedHeader("*"); // Allow all headers
		config.setAllowCredentials(true); // Allow cookies or credentials

		source.registerCorsConfiguration("/**", config);
		return new CorsWebFilter(source);
	}

}
