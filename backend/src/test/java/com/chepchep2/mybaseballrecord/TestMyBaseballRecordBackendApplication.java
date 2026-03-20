package com.chepchep2.mybaseballrecord;

import org.springframework.boot.SpringApplication;

public class TestMyBaseballRecordBackendApplication {

	public static void main(String[] args) {
		SpringApplication.from(MyBaseballRecordBackendApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
