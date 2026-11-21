package com.hospital.management.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("SEBASETHU Hospital Management System API")
                        .description("Professional Healthcare Management REST API providing patient care, appointments, clinical consultation records, itemized billing, and RBAC.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Sebasethu Clinical Engineering")
                                .email("support@sebasethu.health")
                                .url("https://sebasethu.health"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://sebasethu.health/terms")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter your JWT token obtained from /auth/login")));
    }
}
