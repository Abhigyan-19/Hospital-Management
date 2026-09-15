package com.hospital.management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
// this is an annotation. it is metadata attached to the class, method or field...
// it tells Spring boot that this is the main application class
public class HospitalManagementApplication {

    public static void main(String[] args) {

        SpringApplication.run(
                HospitalManagementApplication.class,// it refers to the class itself.
                args // it passes command-line arguments received b the java program.

        );

    }

}