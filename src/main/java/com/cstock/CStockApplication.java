package com.cstock;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CStockApplication {

	public static void main(String[] args) {
		SpringApplication.run(CStockApplication.class, args);
	}

}
